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
    <div className="rounded-xl bg-[#0F172A] p-5 text-white">
      <p className="text-[11px] font-medium text-white/40 uppercase tracking-wide">
        Total Revenue
      </p>
      <p className="mb-4 text-[10px] text-white/25">{period}</p>

      <p className="text-[38px] font-bold leading-none tracking-tight tabular-nums">
        {formatCurrency(totalRevenue, "USD", true)}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {pctChange !== 0 && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              isPositive
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            )}
          >
            {isPositive ? "+" : ""}
            {pctChange.toFixed(1)}%
          </span>
        )}
        <span className="text-[11px] text-white/30">
          vs {formatCurrency(previousRevenue, "USD", true)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-4">
        <div>
          <p className="text-[11px] text-white/40">Avg. order</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {transactionCount > 0
              ? formatCurrency(totalRevenue / transactionCount)
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-white/40">Transactions</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {transactionCount > 0 ? transactionCount : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}
