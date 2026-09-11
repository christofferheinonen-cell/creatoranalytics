import type { Metadata } from "next"
import { Users, TrendingUp, Phone } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { HeroCard } from "@/components/dashboard/HeroCard"
import { FunnelChart } from "@/components/dashboard/FunnelChart"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { ConnectedSources } from "@/components/dashboard/ConnectedSources"
import { StatCard } from "@/components/shared/StatCard"
import { pctChange, formatNumber } from "@/lib/utils"
import type { ConnectedAccountSummary, FunnelStage, Provider } from "@/types"

export const metadata: Metadata = { title: "Dashboard" }

const PROVIDER_LABELS: Record<Provider, string> = {
  STRIPE: "Stripe",
  KIT: "Kit (ConvertKit)",
  MANYCHAT: "ManyChat",
  CALENDLY: "Calendly",
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
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

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
      select: { provider: true, status: true, lastSyncedAt: true },
    }),
    prisma.funnelEvent.groupBy({
      by: ["type", "source"],
      where: { userId },
      _count: { id: true },
    }),
  ])

  const totalRevenue = currentRevenue._sum.value?.toNumber() ?? 0
  const prevRevenue = previousRevenue._sum.value?.toNumber() ?? 0
  const contactsTrend = pctChange(totalContacts, previousContacts)

  const revenueChartData = groupByWeek(revenueEvents)

  const countByType = new Map<string, number>(funnelCounts.map((r) => [r.type as string, r._count.id]))
  const sourceByType = new Map<string, string>(funnelCounts.map((r) => [r.type as string, r.source.toLowerCase()]))

  function makeStage(type: string, label: string): FunnelStage | null {
    const count = countByType.get(type)
    if (!count) return null
    return { stage: type, label, count, source: sourceByType.get(type) ?? "" }
  }

  const freebbieFunnel = [
    makeStage("COMMENT", "Social Comment"),
    makeStage("DM_STARTED", "DM Started"),
    makeStage("FREEBIE_CLAIMED", "Freebie Claimed"),
    makeStage("SUBSCRIBED", "Email Subscribed"),
    makeStage("PURCHASED", "Purchased"),
  ].filter(Boolean) as FunnelStage[]

  const callFunnel = [
    makeStage("COMMENT", "Social Comment"),
    makeStage("DM_STARTED", "DM Started"),
    makeStage("LINK_CLICKED", "Video Viewed"),
    makeStage("CALL_SCHEDULED", "Call Booked"),
    makeStage("CALL_COMPLETED", "Call Completed"),
    makeStage("PURCHASED", "Purchased"),
  ].filter(Boolean) as FunnelStage[]

  const combinedFunnel = [
    makeStage("COMMENT", "Social Comment"),
    makeStage("DM_STARTED", "DM Started"),
    makeStage("SUBSCRIBED", "Email Subscribed"),
    makeStage("CALL_SCHEDULED", "Call Booked"),
    makeStage("PURCHASED", "Purchased"),
  ].filter(Boolean) as FunnelStage[]

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

  return (
    <div className="flex gap-6 animate-fade-in">
      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">
            Hello {firstName},
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Here&apos;s what&apos;s happening with your creator business.
          </p>
        </div>

        {/* Category stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Contacts"
            description="Leads and subscribers."
            value={formatNumber(totalContacts)}
            trend={contactsTrend}
            href="/contacts"
            bg="bg-[#FFF7ED]"
          />
          <StatCard
            label="Active Subscribers"
            description="Current email list."
            value={formatNumber(activeSubscribers)}
            href="/contacts"
            bg="bg-[#EEF2FF]"
          />
          <StatCard
            label="Calls Booked"
            description="Discovery calls this month."
            value={formatNumber(callsBooked)}
            bg="bg-[#F0FDF4]"
          />
        </div>

        {/* Funnel chart */}
        <FunnelChart
          freebbieFunnel={freebbieFunnel}
          callFunnel={callFunnel}
          combinedFunnel={combinedFunnel}
        />

        {/* Revenue chart */}
        <RevenueChart data={revenueChartData} />
      </div>

      {/* ── Right panel ── */}
      <div className="hidden w-[272px] shrink-0 flex-col gap-4 lg:flex">
        <HeroCard
          totalRevenue={totalRevenue}
          previousRevenue={prevRevenue}
          transactionCount={transactionCount}
        />
        <ConnectedSources accounts={integrations} />
      </div>
    </div>
  )
}
