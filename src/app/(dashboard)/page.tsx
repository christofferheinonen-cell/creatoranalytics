import type { Metadata } from "next"
import { Users, TrendingUp, Phone, DollarSign } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { HeroCard } from "@/components/dashboard/HeroCard"
import { FunnelChart } from "@/components/dashboard/FunnelChart"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { ConnectedSources } from "@/components/dashboard/ConnectedSources"
import { StatCard } from "@/components/shared/StatCard"
import { pctChange, formatNumber } from "@/lib/utils"
import {
  MOCK_FREEBIE_FUNNEL,
  MOCK_CALL_FUNNEL,
  MOCK_COMBINED_FUNNEL,
} from "@/lib/mock-data"
import type { ConnectedAccountSummary, Provider } from "@/types"

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

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000)

  const [
    currentRevenue,
    previousRevenue,
    totalContacts,
    previousContacts,
    activeSubscribers,
    callsBooked,
    revenueEvents,
    connectedAccounts,
  ] = await Promise.all([
    prisma.funnelEvent.aggregate({
      where: { userId, type: "PURCHASED", timestamp: { gte: thirtyDaysAgo } },
      _sum: { value: true },
    }),
    prisma.funnelEvent.aggregate({
      where: { userId, type: "PURCHASED", timestamp: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { value: true },
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
  ])

  const totalRevenue = currentRevenue._sum.value?.toNumber() ?? 0
  const prevRevenue = previousRevenue._sum.value?.toNumber() ?? 0
  const contactsTrend = pctChange(totalContacts, previousContacts)
  const revenueTrend = pctChange(totalRevenue, prevRevenue)

  const revenueChartData = groupByWeek(revenueEvents)

  const integrations: ConnectedAccountSummary[] = connectedAccounts.map((a) => ({
    provider: a.provider,
    label: PROVIDER_LABELS[a.provider],
    status: a.status,
    lastSyncedAt: a.lastSyncedAt?.toISOString() ?? null,
  }))

  // Pad with disconnected entries for providers not yet connected
  const connectedProviders = new Set(integrations.map((i) => i.provider))
  for (const provider of Object.keys(PROVIDER_LABELS) as Provider[]) {
    if (!connectedProviders.has(provider)) {
      integrations.push({ provider, label: PROVIDER_LABELS[provider], status: "disconnected", lastSyncedAt: null })
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <HeroCard totalRevenue={totalRevenue} previousRevenue={prevRevenue} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Contacts"
          value={formatNumber(totalContacts)}
          trend={contactsTrend}
          icon={<Users className="h-4 w-4" />}
          accent="indigo"
        />
        <StatCard
          label="Active Subscribers"
          value={formatNumber(activeSubscribers)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Calls Booked"
          value={formatNumber(callsBooked)}
          icon={<Phone className="h-4 w-4" />}
          accent="teal"
        />
        <StatCard
          label="Overall CVR"
          value={totalContacts > 0 ? `${((callsBooked / totalContacts) * 100).toFixed(1)}%` : "—"}
          trend={revenueTrend}
          trendLabel="revenue vs prev period"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FunnelChart
            freebbieFunnel={MOCK_FREEBIE_FUNNEL}
            callFunnel={MOCK_CALL_FUNNEL}
            combinedFunnel={MOCK_COMBINED_FUNNEL}
          />
        </div>
        <ConnectedSources accounts={integrations} />
      </div>

      <RevenueChart data={revenueChartData} />
    </div>
  )
}
