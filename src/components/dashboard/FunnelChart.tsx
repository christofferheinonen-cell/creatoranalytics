"use client"

import { ArrowDown } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChartCard } from "@/components/shared/ChartCard"
import { formatNumber } from "@/lib/utils"
import type { FunnelStage } from "@/types"

// Source → display color token
const SOURCE_COLORS: Record<string, string> = {
  manychat: "bg-orange-400",
  kit: "bg-brand-teal-500",
  stripe: "bg-brand-indigo-500",
  calendly: "bg-violet-500",
  "kit/manychat": "bg-brand-teal-400",
  mixed: "bg-slate-400",
}

function NoData() {
  return (
    <div className="flex h-40 items-center justify-center">
      <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/40">
        No Data
      </span>
    </div>
  )
}

function FunnelBar({ stages }: { stages: FunnelStage[] }) {
  if (stages.length === 0) return <NoData />

  const topCount = stages[0].count

  return (
    <div className="flex flex-col">
      {stages.map((stage, i) => {
        const widthPct = (stage.count / topCount) * 100
        const prevCount = i > 0 ? stages[i - 1].count : null
        const convRate =
          prevCount !== null && prevCount > 0
            ? ((stage.count / prevCount) * 100).toFixed(1)
            : null

        return (
          <div key={stage.stage}>
            {/* Conversion rate connector */}
            {convRate && (
              <div className="flex items-center gap-1.5 py-1.5 pl-[148px]">
                <ArrowDown className="h-3 w-3 text-muted-foreground/50" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {convRate}% converted
                </span>
              </div>
            )}

            {/* Stage row */}
            <div className="flex items-center gap-3">
              {/* Label — fixed width right-aligned */}
              <div className="w-36 flex-shrink-0 text-right">
                <span className="text-xs font-medium text-muted-foreground">
                  {stage.label}
                </span>
              </div>

              {/* Bar + count */}
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <div className="relative flex h-8 flex-1 items-center">
                  <div
                    className="h-full rounded-md transition-all duration-500"
                    style={{
                      width: `${Math.max(widthPct, 2)}%`,
                      background: "linear-gradient(90deg, #6366F1 0%, #818CF8 100%)",
                    }}
                  />
                </div>
                <div className="flex w-20 flex-shrink-0 items-center gap-1.5">
                  <span className="text-sm font-semibold text-brand-navy">
                    {formatNumber(stage.count)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {((stage.count / topCount) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface FunnelChartProps {
  freebbieFunnel: FunnelStage[]
  callFunnel: FunnelStage[]
  combinedFunnel: FunnelStage[]
}

export function FunnelChart({
  freebbieFunnel,
  callFunnel,
  combinedFunnel,
}: FunnelChartProps) {
  const allTopCount = combinedFunnel[0]?.count ?? 0
  const allPurchased = combinedFunnel[combinedFunnel.length - 1]?.count ?? 0
  const overallConversion =
    allTopCount > 0 ? ((allPurchased / allTopCount) * 100).toFixed(2) : "—"

  return (
    <ChartCard
      title="Funnel Performance"
      description={`Overall conversion: ${overallConversion}% · top-of-funnel to revenue`}
      actions={
        <span className="rounded-full bg-brand-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-indigo-600">
          Live data
        </span>
      }
    >
      <Tabs defaultValue="all">
        <TabsList className="mb-5">
          <TabsTrigger value="all">All Funnels</TabsTrigger>
          <TabsTrigger value="freebie">Freebie Funnel</TabsTrigger>
          <TabsTrigger value="call">Call Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <FunnelBar stages={combinedFunnel} />
          <p className="mt-4 text-[11px] text-muted-foreground">
            Combined view showing aggregate top-of-funnel to revenue across both funnel types.
          </p>
        </TabsContent>

        <TabsContent value="freebie">
          <FunnelBar stages={freebbieFunnel} />
          <p className="mt-4 text-[11px] text-muted-foreground">
            Comment → DM → Freebie → Email subscriber → Self-serve purchase
          </p>
        </TabsContent>

        <TabsContent value="call">
          <FunnelBar stages={callFunnel} />
          <p className="mt-4 text-[11px] text-muted-foreground">
            Comment → DM → Video viewed → Call booked → Call completed → Payment collected
          </p>
        </TabsContent>
      </Tabs>
    </ChartCard>
  )
}
