import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { HeroCard } from "@/components/dashboard/HeroCard"
import type { FunnelDef } from "@/components/dashboard/FunnelChart"
import { DashboardFunnelView } from "@/components/dashboard/DashboardFunnelView"
import { extractFunnelStages, getFunnelStageCounts } from "@/lib/funnel-analytics"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { ConnectedSources } from "@/components/dashboard/ConnectedSources"
import { RevenuePill } from "@/components/dashboard/RevenuePill"
import { SetupProgress } from "@/components/dashboard/SetupProgress"
import { TrafficCard } from "@/components/dashboard/TrafficCard"
import { fetchGA4LiveSummary } from "@/integrations/google-analytics"
import { pctChange, formatNumber } from "@/lib/utils"
import type { ConnectedAccountSummary, Provider, GA4Summary } from "@/types"
import type { MockBuilderNode } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Dashboard" }

const PROVIDER_LABELS: Record<Provider, string> = {
  STRIPE: "Stripe",
  KIT: "Kit (ConvertKit)",
  MANYCHAT: "ManyChat",
  CALENDLY: "Calendly",
  GOOGLE_ANALYTICS: "Google Analytics 4",
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function groupByWeek(events: { value: { toNumber(): number } | null; timestamp: Date }[]) {
  const weeks = new Map<string, number>()
  for (const event of events) {
    const d = new Date(event.timestamp)
    const weekOfMonth = Math.ceil(d.getDate() / 7)
    const key = `${MONTHS[d.getMonth()]} W${weekOfMonth}`
    weeks.set(key, (weeks.get(key) ?? 0) + (event.value?.toNumber() ?? 0))
  }
  return [...weeks.entries()].map(([week, revenue]) => ({ week, revenue }))
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id
  const firstName = session!.user?.name?.split(" ")[0] ?? "there"

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000)

  const [
    currentRevenue,
    previousRevenue,
    transactionCount,
    totalContacts,
    previousContacts,
    activeSubscribers,
    callsBooked,
    revenueEvents,
    connectedAccounts,
    funnelCounts,
    stripeContactCount,
    kitContactCount,
    manychatContactCount,
    calendlyContactCount,
    userFunnels,
  ] = await Promise.all([
    prisma.funnelEvent.aggregate({
      where: { userId, type: "PURCHASED", timestamp: { gte: thirtyDaysAgo } },
      _sum: { value: true },
    }),
    prisma.funnelEvent.aggregate({
      where: { userId, type: "PURCHASED", timestamp: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { value: true },
    }),
    prisma.funnelEvent.count({
      where: { userId, type: "PURCHASED", timestamp: { gte: thirtyDaysAgo } },
    }),
    prisma.contact.count({ where: { userId } }),
    prisma.contact.count({ where: { userId, createdAt: { lt: thirtyDaysAgo } } }),
    prisma.contact.count({ where: { userId, currentStage: "SUBSCRIBED" } }),
    prisma.funnelEvent.count({
      where: { userId, type: "CALL_SCHEDULED", timestamp: { gte: thirtyDaysAgo } },
    }),
    prisma.funnelEvent.findMany({
      where: { userId, type: "PURCHASED", timestamp: { gte: twelveWeeksAgo } },
      select: { value: true, timestamp: true },
      orderBy: { timestamp: "asc" },
    }),
    prisma.connectedAccount.findMany({
      where: { userId },
      select: { provider: true, status: true, lastSyncedAt: true, accessToken: true },
    }),
    prisma.funnelEvent.groupBy({
      by: ["type", "source"],
      where: { userId },
      _count: { id: true },
    }),
    prisma.contact.count({ where: { userId, stripeCustomerId: { not: null } } }),
    prisma.contact.count({ where: { userId, kitSubscriberId: { not: null } } }),
    prisma.contact.count({ where: { userId, manychatUserId: { not: null } } }),
    prisma.contact.count({ where: { userId, calendlyInviteeId: { not: null } } }),
    prisma.funnel.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
  ])

  const totalRevenue = currentRevenue._sum.value?.toNumber() ?? 0
  const prevRevenue = previousRevenue._sum.value?.toNumber() ?? 0
  const contactsTrend = totalContacts - previousContacts

  // Fetch GA4 live summary if connected
  const ga4Account = connectedAccounts.find(
    (a) => a.provider === "GOOGLE_ANALYTICS" && a.status === "ACTIVE" && a.accessToken
  )
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID
  let ga4Summary: GA4Summary | null = null
  if (ga4Account?.accessToken && propertyId) {
    ga4Summary = await fetchGA4LiveSummary(ga4Account.accessToken, propertyId)
  }

  const revenueChartData = groupByWeek(revenueEvents)

  const funnelDefs: FunnelDef[] = await Promise.all(
    userFunnels.map(async (funnel) => {
      const nodes = Array.isArray(funnel.nodes) ? (funnel.nodes as unknown as MockBuilderNode[]) : []
      const stages = extractFunnelStages(nodes)
      const counted = stages.length > 0 ? await getFunnelStageCounts(userId, stages) : []
      return {
        id: funnel.id,
        name: funnel.name,
        stages: counted.map((s) => ({ stage: s.eventType, label: s.label, count: s.count, source: s.source })),
      }
    })
  )

  // Build integration list
  const integrations: ConnectedAccountSummary[] = connectedAccounts.map((a) => ({
    provider: a.provider,
    label: PROVIDER_LABELS[a.provider],
    status: a.status,
    lastSyncedAt: a.lastSyncedAt?.toISOString() ?? null,
  }))
  const connectedProviders = new Set(integrations.map((i) => i.provider))
  for (const provider of Object.keys(PROVIDER_LABELS) as Provider[]) {
    if (!connectedProviders.has(provider)) {
      integrations.push({ provider, label: PROVIDER_LABELS[provider], status: "disconnected", lastSyncedAt: null })
    }
  }

  // Source shares for top sources bar
  const sourceCounts: [Provider, number][] = [
    ["STRIPE", stripeContactCount],
    ["KIT", kitContactCount],
    ["MANYCHAT", manychatContactCount],
    ["CALENDLY", calendlyContactCount],
  ]
  const totalFromSources = sourceCounts.reduce((a, [, n]) => a + n, 0)
  const sourceShares = sourceCounts
    .map(([provider, count]) => ({
      provider,
      pct: totalFromSources > 0 ? Math.round((count / totalFromSources) * 100) : 0,
    }))
    .filter((s) => s.pct > 0)

  // Setup steps
  const connectedSet = new Set(connectedAccounts.filter((a) => a.status === "ACTIVE").map((a) => a.provider))
  const hasAnyFunnelEvents = funnelCounts.length > 0
  const setupSteps = [
    { label: "Connect Stripe", done: connectedSet.has("STRIPE"), href: "/integrations" },
    { label: "Import email list", done: connectedSet.has("KIT"), href: "/integrations" },
    { label: "Connect Calendly", done: connectedSet.has("CALENDLY"), href: "/integrations" },
    { label: "Publish first funnel", done: hasAnyFunnelEvents, href: "/funnels" },
  ]

  const stripeConnected = connectedSet.has("STRIPE")

  return (
    <div
      className="flex flex-wrap gap-[22px] items-start"
      style={{ flex: 1, overflowY: "auto", padding: "6px 22px 26px" }}
    >
      {/* Left column */}
      <div className="flex flex-col gap-[18px] min-w-0" style={{ flex: "4 1 460px" }}>
        {/* Greeting + date range */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[30px] font-bold tracking-[-0.04em] text-cr-black m-0">
              Hello {firstName},
            </h1>
            <p className="text-[15px] text-cr-text-3 mt-[7px] mb-0">
              Here&apos;s what&apos;s happening with your creator business.
            </p>
          </div>
          {/* Date range picker */}
          <div
            className="flex gap-[2px] p-1"
            style={{ background: "#f7f9fe", border: "1px solid #edf2fb", borderRadius: "99px" }}
          >
            {["30 days", "90 days", "Year"].map((label, i) => (
              <button
                key={label}
                className="border-none font-[inherit] text-[13px] font-semibold px-[15px] py-[7px] rounded-full cursor-pointer transition-colors whitespace-nowrap"
                style={
                  i === 0
                    ? { background: "#fff", color: "#0b0b0f", boxShadow: "0 1px 3px rgba(11,11,15,.1)" }
                    : { background: "transparent", color: "#7b8497" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat tiles */}
        <HeroCard
          totalContacts={totalContacts}
          activeSubscribers={activeSubscribers}
          callsBooked={callsBooked}
          contactsTrend={contactsTrend}
        />

        {/* Pro upgrade banner */}
        <div
          className="flex items-center gap-[14px] flex-wrap"
          style={{ background: "#0b0b0f", borderRadius: "24px", padding: "16px 20px", color: "#fff" }}
        >
          <span
            className="text-[11px] font-bold tracking-[0.12em] text-cr-blue-600 rounded-full px-[11px] py-1"
            style={{ border: "1px solid rgba(171,196,255,.35)" }}
          >
            PRO
          </span>
          <span className="text-[16px] font-semibold tracking-[-0.02em]">
            Unlock automated revenue attribution
          </span>
          <Link
            href="/settings"
            className="ml-auto flex items-center gap-[9px] text-[13.5px] font-semibold text-cr-black rounded-full px-4 py-[9px] whitespace-nowrap hover:bg-white transition-colors"
            style={{ background: "#abc4ff" }}
          >
            Switch to Pro
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 14 14 6M7 6h7v7" />
            </svg>
          </Link>
        </div>

        {/* Funnel performance quick view */}
        <DashboardFunnelView funnels={funnelDefs} />

        {/* Revenue chart */}
        <RevenueChart data={revenueChartData} stripeConnected={stripeConnected} />
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-[18px] min-w-0" style={{ flex: "1 1 300px" }}>
        <RevenuePill totalRevenue={totalRevenue} transactionCount={transactionCount} />
        <ConnectedSources accounts={integrations} sourceShares={sourceShares} />
        <TrafficCard data={ga4Summary} />
        <SetupProgress steps={setupSteps} />
      </div>
    </div>
  )
}
