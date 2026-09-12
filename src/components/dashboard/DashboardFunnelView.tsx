"use client"

import { useState, useEffect } from "react"
import { FunnelChart } from "./FunnelChart"
import type { FunnelDef } from "./FunnelChart"

export function DashboardFunnelView({ funnels }: { funnels: FunnelDef[] }) {
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dashboard-funnel-selection")
      const parsed: string[] | null = stored ? JSON.parse(stored) : null
      if (parsed) {
        const valid = parsed.filter((id) => funnels.some((f) => f.id === id))
        setSelectedIds(valid.length > 0 ? valid : funnels.map((f) => f.id))
      } else {
        setSelectedIds(funnels.map((f) => f.id))
      }
    } catch {
      setSelectedIds(funnels.map((f) => f.id))
    }
  }, [funnels])

  const toggleFunnel = (id: string) => {
    setSelectedIds((prev) => {
      if (!prev) return prev
      const next = prev.includes(id)
        ? prev.length > 1 ? prev.filter((x) => x !== id) : prev
        : [...prev, id]
      try { localStorage.setItem("dashboard-funnel-selection", JSON.stringify(next)) } catch {}
      return next
    })
  }

  const visibleFunnels = selectedIds === null
    ? funnels
    : funnels.filter((f) => selectedIds.includes(f.id))

  return (
    <div className="flex flex-col gap-3">
      {funnels.length > 1 && selectedIds !== null && (
        <div className="flex flex-wrap gap-2">
          {funnels.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFunnel(f.id)}
              className="rounded-full px-3 py-1 text-[12px] font-semibold transition-colors border-none cursor-pointer"
              style={
                selectedIds.includes(f.id)
                  ? { background: "#0b0b0f", color: "#fff" }
                  : { background: "#f3f4f6", color: "#6b7280" }
              }
            >
              {f.name}
            </button>
          ))}
        </div>
      )}
      <FunnelChart funnels={visibleFunnels} />
    </div>
  )
}
