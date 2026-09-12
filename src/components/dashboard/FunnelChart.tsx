"use client"

import Link from "next/link"
import { useState } from "react"
import type { FunnelStage } from "@/types"

export interface FunnelDef {
  id: string
  name: string
  stages: FunnelStage[]
}

function FunnelBar({ stages }: { stages: FunnelStage[] }) {
  if (stages.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-[13.5px] text-cr-text-3">
          No data for this funnel yet. Connect integrations and make sure your funnel is saving events.
        </p>
      </div>
    )
  }

  const top = stages[0].count

  return (
    <div className="flex flex-col">
      {stages.map((stage, i) => {
        const pct = top > 0 ? (stage.count / top) * 100 : 0
        const prevCount = i > 0 ? stages[i - 1].count : stage.count
        const dropPct = prevCount > 0 ? Math.round(((prevCount - stage.count) / prevCount) * 100) : 0
        const isEmpty = stage.count === 0

        return (
          <div
            key={stage.stage}
            className="grid items-center gap-[14px]"
            style={{
              gridTemplateColumns: "minmax(110px, 1fr) minmax(70px, 2.2fr) 90px",
              padding: "14px 0",
              borderTop: "1px solid #f2f5fb",
            }}
          >
            <div className="flex items-center gap-[10px] min-w-0">
              <span className="text-[11.5px] font-bold text-cr-text-5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[14px] font-semibold text-cr-black truncate">
                {stage.label}
              </span>
            </div>
            <div className="h-[30px] rounded-full overflow-hidden" style={{ background: "#f5f8fe" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, isEmpty ? 4 : pct)}%`,
                  background: isEmpty ? "#dde4f2" : i === 0 ? "#abc4ff" : "#c1d3fe",
                }}
              />
            </div>
            <div className="flex flex-col items-end">
              <span className={isEmpty ? "text-[15px] font-bold text-cr-text-4" : "text-[15px] font-bold text-cr-black"}>
                {stage.count.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {Math.round(pct)}%
                {i > 0 && !isEmpty && dropPct > 0 && (
                  <span className="ml-1 text-red-400">↓{dropPct}%</span>
                )}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface FunnelChartProps {
  funnels: FunnelDef[]
}

export function FunnelChart({ funnels }: FunnelChartProps) {
  const [activeId, setActiveId] = useState<string>(funnels[0]?.id ?? "")

  if (funnels.length === 0) {
    return (
      <section style={{ border: "1px solid #edf2fb", borderRadius: "26px" }}>
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-8">
          <p className="text-[15px] font-semibold text-cr-black">No funnels built yet</p>
          <p className="text-[13.5px] text-cr-text-3 max-w-xs">
            Build a funnel to start tracking conversion rates across your integrations.
          </p>
          <Link
            href="/funnels/new"
            className="text-[13px] font-semibold text-white rounded-full px-[15px] py-2 hover:opacity-90 transition-opacity"
            style={{ background: "#0b0b0f" }}
          >
            Build your first funnel
          </Link>
        </div>
      </section>
    )
  }

  const activeFunnel = funnels.find((f) => f.id === activeId) ?? funnels[0]

  return (
    <section style={{ border: "1px solid #edf2fb", borderRadius: "26px" }}>
      {/* Header */}
      <div
        className="flex items-start justify-between gap-4 flex-wrap"
        style={{ padding: "20px 20px 16px" }}
      >
        <div>
          <div className="flex items-center gap-[10px]">
            <h2 className="text-[17px] font-bold tracking-[-0.025em] text-cr-black m-0">
              Funnel performance
            </h2>
            <span
              className="text-[11.5px] font-semibold text-cr-text-2 rounded-full px-[9px] py-[3px]"
              style={{ background: "#edf2fb" }}
            >
              {activeFunnel.stages.length} stages
            </span>
          </div>
          <p className="text-[13.5px] text-cr-text-3 mt-[5px] mb-0">
            Distinct contacts per stage · all time
          </p>
        </div>

        {/* Funnel tab switcher */}
        {funnels.length > 1 && (
          <div
            className="flex overflow-hidden"
            style={{ border: "1px solid #edf2fb", borderRadius: "99px" }}
          >
            {funnels.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className="border-none font-[inherit] text-[12.5px] font-semibold px-[15px] py-2 cursor-pointer transition-colors max-w-[140px] truncate"
                style={{
                  background: activeId === f.id ? "#0b0b0f" : "#fff",
                  color: activeId === f.id ? "#fff" : "#4a5164",
                  borderLeft: i > 0 ? "1px solid #edf2fb" : "none",
                }}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Funnel bars */}
      <div style={{ padding: "0 20px 16px" }}>
        <FunnelBar stages={activeFunnel.stages} />
      </div>
    </section>
  )
}
