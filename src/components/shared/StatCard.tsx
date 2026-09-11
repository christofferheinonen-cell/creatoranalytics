import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface StatCardProps {
  label: string
  description: string
  value: string
  trend?: number
  trendLabel?: string
  href?: string
  bg?: string        // tailwind bg class e.g. "bg-[#FFF7ED]"
  className?: string
}

export function StatCard({
  label,
  description,
  value,
  trend,
  trendLabel,
  href,
  bg = "bg-white",
  className,
}: StatCardProps) {
  const hasTrend = trend !== undefined

  return (
    <div className={cn("rounded-xl border border-transparent p-5", bg, className)}>
      <h3 className="text-[15px] font-semibold text-brand-navy">{label}</h3>
      <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-[38px] font-bold leading-none tracking-tight text-brand-navy tabular-nums">
            {value}
          </p>
          {hasTrend && (
            <div className="mt-2 flex items-center gap-1">
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : trend < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <span
                className={cn(
                  "text-[12px] font-medium",
                  trend > 0
                    ? "text-emerald-600"
                    : trend < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                )}
              >
                {trend > 0 ? "+" : ""}
                {trend.toFixed(1)}%{" "}
                <span className="font-normal text-muted-foreground">
                  {trendLabel ?? "vs last period"}
                </span>
              </span>
            </div>
          )}
        </div>

        {href && (
          <Link
            href={href}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-white transition-opacity hover:opacity-75"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
