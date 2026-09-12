"use client"

import Link from "next/link"
import { useState } from "react"
import { Info } from "lucide-react"
import type { FunnelStage } from "@/types"

function FunnelBar({ stages }: { stages: FunnelStage[] }) {
  if (stages.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-[13.5px] text-cr-text-3">No funnel data yet. Connect an integration to see your funnel.</p>
      </div>
    )
  }

  const top = stages[0].count

  return (
    <div className="flex flex-col">
      {stages.map((stage, i) => {
        const pct = top > 0 ? (stage.count / top) * 100 : 0
        const isEmpty = stage.count === 0

        return (
          <div
            key={stage.stage}
            className="grid items-center gap-[14px]"
            style={{
              gridTemplateColumns: "minmax(110px, 1fr) minmax(70px, 2.2fr) 76px",
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
            <div
              className="h-[30px] rounded-full overflow-hidden"
              style={{ background: "#f5f8fe" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, isEmpty ? 4 : pct)}%`,
                  background: isEmpty ? "#dde4f2" : i === 0 ? "#abc4ff" : "#c1d3fe",
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <span
                className={
                  isEmpty
                    ? "text-[15px] font-bold text-cr-text-4"
                    : "text-[15px] font-bold text-cr-black"
                }
              >
                {stage.count}
              </span>
              <span
                className="text-[12px] font-semibold rounded-full px-2 py-[3px]"
                style={{
                  background: isEmpty ? "#f5f6f8" : "#e2eafc",
                  color: isEmpty ? "#7b8497" : "#0b0b0f",
                }}
              >
                {Math.round(pct)}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

type TabKey = "all" | "freebie" | "call"

interface FunnelChartProps {
  freebbieFunnel: FunnelStage[]
  callFunnel: FunnelStage[]
  combinedFunnel: FunnelStage[]
}

export function FunnelChart({ freebbieFunnel, callFunnel, combinedFunnel }: FunnelChartProps) {
  const [tab, setTab] = useState<TabKey>("all")
  const stageCount = combinedFunnel.length

  const stages: Record<TabKey, FunnelStage[]> = {
    all: combinedFunnel,
    freebie: freebbieFunnel,
    call: callFunnel,
  }

  const hasCalendly = callFunnel.some((s) => s.stage === "CALL_SCHEDULED" && s.count > 0)

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
              {stageCount} stages
            </span>
          </div>
          <p className="text-[13.5px] text-cr-text-3 mt-[5px] mb-0">
            Top of funnel to revenue, last 30 days.
          </p>
        </div>

        {/* Tab switcher */}
        <div
          className="flex overflow-hidden"
          style={{ border: "1px solid #edf2fb", borderRadius: "99px" }}
        >
          {(["all", "freebie", "call"] as TabKey[]).map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="border-none font-[inherit] text-[12.5px] font-semibold px-[15px] py-2 cursor-pointer transition-colors capitalize"
              style={{
                background: tab === t ? "#0b0b0f" : "#fff",
                color: tab === t ? "#fff" : "#4a5164",
                borderLeft: i > 0 ? "1px solid #edf2fb" : "none",
              }}
            >
              {t === "all" ? "All" : t === "freebie" ? "Freebie" : "Call"}
            </button>
          ))}
        </div>
      </div>

      {/* Funnel bars */}
      <div style={{ padding: "0 20px 8px" }}>
        <FunnelBar stages={stages[tab]} />
      </div>

      {/* Tip */}
      {!hasCalendly && (
        <div
          className="flex items-center gap-3 flex-wrap"
          style={{ margin: "0 20px 20px", padding: "14px 16px", background: "#f7f9fe", borderRadius: "18px" }}
        >
          <Info className="shrink-0 h-[18px] w-[18px] text-cr-black" strokeWidth={1.5} />
          <span className="text-[13.5px] text-cr-text-2 flex-1 min-w-[200px]">
            Both funnels convert to email but drop off before a call.
          </span>
          <Link
            href="/integrations"
            className="text-[13px] font-semibold text-white rounded-full px-[15px] py-2 whitespace-nowrap hover:opacity-90 transition-opacity"
            style={{ background: "#0b0b0f" }}
          >
            Connect Calendly
          </Link>
        </div>
      )}
    </section>
  )
}
