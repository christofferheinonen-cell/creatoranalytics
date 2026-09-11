import { cn } from "@/lib/utils"
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
  const isPositive = pctChange >= 0

  return (
    <div className="rounded-xl bg-[#0F172A] px-7 py-6 text-white">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Primary metric */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-wide text-white/40 uppercase">
            Total Revenue · {period}
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight">
              {formatCurrency(totalRevenue, "USD", true)}
            </span>
            {pctChange !== 0 && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isPositive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                )}
              >
                {isPositive ? "+" : ""}
                {pctChange.toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/30">
            vs {formatCurrency(previousRevenue, "USD", true)} previous period
          </p>
        </div>

        {/* Secondary metrics */}
        <div className="flex gap-8 sm:border-l sm:border-white/8 sm:pl-8">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-white/40">Avg. order</span>
            <span className="text-2xl font-semibold tabular-nums">
              {transactionCount > 0
                ? formatCurrency(totalRevenue / transactionCount)
                : "—"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-white/40">Transactions</span>
            <span className="text-2xl font-semibold tabular-nums">
              {transactionCount > 0 ? transactionCount : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
