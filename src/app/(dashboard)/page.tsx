import type { Metadata } from "next"
import { Users, TrendingUp, Phone, DollarSign } from "lucide-react"
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
  MOCK_REVENUE_DATA,
  MOCK_STATS,
  MOCK_INTEGRATIONS,
} from "@/lib/mock-data"
import type { ConnectedAccountSummary } from "@/types"

export const metadata: Metadata = { title: "Dashboard" }

// TODO: Replace mock data with real DB queries once integrations are wired up.
// Pattern: const stats = await getStatsForUser(session.user.id)
// All mock imports above can be deleted once real data flows through.

export default function DashboardPage() {
  const s = MOCK_STATS
  const contactsTrend = pctChange(s.totalContacts, s.previousContacts)
  const revenueTrend = pctChange(s.totalRevenue, s.previousRevenue)

  // Mock integrations typed as ConnectedAccountSummary
  const integrations = MOCK_INTEGRATIONS as ConnectedAccountSummary[]

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Hero */}
      <HeroCard
        totalRevenue={s.totalRevenue}
        previousRevenue={s.previousRevenue}
      />

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Contacts"
          value={formatNumber(s.totalContacts)}
          trend={contactsTrend}
          icon={<Users className="h-4 w-4" />}
          accent="indigo"
        />
        <StatCard
          label="Active Subscribers"
          value={formatNumber(s.activeSubscribers)}
          trend={4.2}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Calls Booked"
          value={formatNumber(s.callsBooked)}
          trend={12.8}
          icon={<Phone className="h-4 w-4" />}
          accent="teal"
        />
        <StatCard
          label="Overall CVR"
          value={`${s.conversionRate}%`}
          trend={revenueTrend}
          trendLabel="vs prev period"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* Main content: funnel + right sidebar */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Funnel chart — takes 2/3 */}
        <div className="lg:col-span-2">
          <FunnelChart
            freebbieFunnel={MOCK_FREEBIE_FUNNEL}
            callFunnel={MOCK_CALL_FUNNEL}
            combinedFunnel={MOCK_COMBINED_FUNNEL}
          />
        </div>

        {/* Right column: connected sources */}
        <ConnectedSources accounts={integrations} />
      </div>

      {/* Revenue chart — full width */}
      <RevenueChart data={MOCK_REVENUE_DATA} />
    </div>
  )
}
