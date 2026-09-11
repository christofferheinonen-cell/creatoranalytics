import { TrendingUp, ArrowUpRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface HeroCardProps {
  totalRevenue: number
  previousRevenue: number
  transactionCount: number
  period?: string
}

export function HeroCard({
  totalRevenue,
  previousRevenue,
  transactionCount,
  period = "last 30 days",
}: HeroCardProps) {
  const pctChange =
    previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-indigo-600 via-brand-indigo-500 to-brand-teal-500 p-6 text-white shadow-card">
      {/* Abstract geometric decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-4 h-56 w-56 rounded-full bg-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-4 right-32 h-20 w-20 rounded-full bg-white/10"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 opacity-80">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Revenue · {period}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight">
              {formatCurrency(totalRevenue, "USD", true)}
            </span>
            {pctChange !== 0 && (
              <div className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5">
                <ArrowUpRight className="h-3 w-3" />
                <span className="text-xs font-semibold">
                  +{pctChange.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <p className="text-xs opacity-70">
            vs {formatCurrency(previousRevenue, "USD", true)} previous period
          </p>
        </div>

        {/* Secondary stats */}
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
              Avg. order
            </span>
            <span className="text-xl font-bold">
              {transactionCount > 0
                ? formatCurrency(totalRevenue / transactionCount)
                : "—"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
              Transactions
            </span>
            <span className="text-xl font-bold">
              {transactionCount > 0 ? transactionCount : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
