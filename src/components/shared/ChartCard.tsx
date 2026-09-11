import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
  contentClassName?: string
}

export function ChartCard({
  title,
  description,
  children,
  actions,
  className,
  contentClassName,
}: ChartCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex items-start justify-between px-5 pb-1 pt-5">
        <div>
          <h3 className="text-[13px] font-semibold text-brand-navy">{title}</h3>
          {description && (
            <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <CardContent className={cn("flex-1 pt-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
