import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string
  trend?: number     // percentage change vs previous period
  trendLabel?: string
  icon?: React.ReactNode
  accent?: "indigo" | "teal" | "none"
  className?: string
}

export function StatCard({
  label,
  value,
  trend,
  trendLabel,
  icon,
  accent = "none",
  className,
}: StatCardProps) {
  const hasTrend = trend !== undefined

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        accent === "indigo" && "border-t-2 border-t-brand-indigo-500",
        accent === "teal" && "border-t-2 border-t-brand-teal-500",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <span className="text-2xl font-bold tracking-tight text-brand-navy">
              {value}
            </span>
            {hasTrend && (
              <div className="mt-1 flex items-center gap-1">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    trend > 0
                      ? "text-emerald-600"
                      : trend < 0
                      ? "text-red-600"
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
          {icon && (
            <div className="rounded-lg bg-surface-subtle p-2 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
