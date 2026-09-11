import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  accent?: "indigo" | "teal" | "amber" | "emerald" | "none"
  className?: string
}

const ACCENT_BG: Record<string, string> = {
  indigo: "bg-indigo-50",
  teal: "bg-teal-50",
  amber: "bg-amber-50",
  emerald: "bg-emerald-50",
  none: "",
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
  const cardBg = ACCENT_BG[accent] || ""

  return (
    <Card className={cn(cardBg && `border-0 ${cardBg}`, className)}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
            {icon && (
              <span className="text-muted-foreground/50">{icon}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold tracking-tight text-brand-navy tabular-nums">
              {value}
            </span>
            {hasTrend && (
              <div className="flex items-center gap-1.5">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : null}
                <span
                  className={cn(
                    "text-xs font-medium",
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
        </div>
      </CardContent>
    </Card>
  )
}
