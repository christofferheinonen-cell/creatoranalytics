"use client"

import { useState, useTransition } from "react"
import {
  Plus,
  TrendingUp,
  ArrowDown,
  Pencil,
  Trash2,
  Copy,
  Lock,
  BarChart2,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatNumber } from "@/lib/utils"
import { FunnelBuilder } from "./FunnelBuilder"
import { EVENT_CONFIG, SOURCE_META } from "@/lib/funnel-config"
import type { FunnelEventType } from "@/types"

export interface FunnelDef {
  id: string
  userId: string | null
  name: string
  description: string | null
  stages: string[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

type RightPanelMode = "idle" | "analytics" | "builder"

// ─── Analytics view ───────────────────────────────────────────────────────────

function FunnelAnalyticsView({
  funnel,
  eventCounts,
  isSystem,
  onEdit,
  onUseAsTemplate,
}: {
  funnel: FunnelDef
  eventCounts: Record<string, number>
  isSystem: boolean
  onEdit: () => void
  onUseAsTemplate: () => void
}) {
  const stages = funnel.stages as FunnelEventType[]
  const topCount = eventCounts[stages[0]] ?? 0
  const bottomCount = eventCounts[stages[stages.length - 1]] ?? 0
  const overallCvr =
    topCount > 0 ? ((bottomCount / topCount) * 100).toFixed(2) : null

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Funnel header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">{funnel.name}</h2>
          {funnel.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{funnel.description}</p>
          )}
          {isSystem && (
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <Lock className="h-3 w-3" />
              System default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSystem ? (
            <Button variant="outline" size="sm" onClick={onUseAsTemplate}>
              <Copy className="h-3.5 w-3.5" />
              Use as template
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {topCount > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-surface-subtle p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Entered funnel
            </p>
            <p className="mt-1 text-xl font-bold text-brand-navy">
              {formatNumber(topCount)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-subtle p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Reached last stage
            </p>
            <p className="mt-1 text-xl font-bold text-brand-navy">
              {formatNumber(bottomCount)}
            </p>
          </div>
          <div className="rounded-lg border border-t-2 border-brand-indigo-500 bg-surface-subtle p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Overall CVR
            </p>
            <p className="mt-1 text-xl font-bold text-brand-navy">
              {overallCvr ? `${overallCvr}%` : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Funnel bar */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Stage breakdown
        </p>
        {topCount === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground/50">
              No event data yet — connect your integrations and sync to see results
            </p>
          </div>
        ) : (
          stages.map((type, i) => {
            const count = eventCounts[type] ?? 0
            const prevCount = i > 0 ? (eventCounts[stages[i - 1]] ?? 0) : null
            const cvr =
              prevCount !== null && prevCount > 0
                ? ((count / prevCount) * 100).toFixed(1)
                : null
            const widthPct = topCount > 0 ? (count / topCount) * 100 : 0
            const meta = EVENT_CONFIG[type]
            const srcMeta = SOURCE_META[meta.source]

            return (
              <div key={`${type}-${i}`}>
                {cvr && (
                  <div className="flex items-center gap-1.5 py-1 pl-[148px]">
                    <ArrowDown className="h-3 w-3 text-muted-foreground/40" />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {cvr}% converted
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-36 flex-shrink-0 text-right">
                    <span className="text-xs font-medium text-muted-foreground">
                      {meta.label}
                    </span>
                  </div>
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
                    <div className="flex w-24 shrink-0 items-center gap-1.5">
                      <span className="text-sm font-semibold text-brand-navy">
                        {formatNumber(count)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {topCount > 0
                          ? `${((count / topCount) * 100).toFixed(0)}%`
                          : ""}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                          srcMeta.badge
                        )}
                      >
                        {srcMeta.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Funnel list item ─────────────────────────────────────────────────────────

function FunnelListItem({
  funnel,
  isActive,
  onSelect,
  onDelete,
}: {
  funnel: FunnelDef
  isActive: boolean
  onSelect: () => void
  onDelete?: () => void
}) {
  const stages = funnel.stages as FunnelEventType[]

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group w-full rounded-lg border px-3 py-2.5 text-left transition-all",
        isActive
          ? "border-brand-indigo-200 bg-brand-indigo-50"
          : "border-transparent bg-surface-subtle hover:border-border hover:bg-surface-card"
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "text-sm font-semibold leading-tight",
            isActive ? "text-brand-indigo-700" : "text-brand-navy"
          )}
        >
          {funnel.name}
        </span>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {stages.length} stage{stages.length !== 1 ? "s" : ""}
        {funnel.isDefault && " · system default"}
      </p>

      {/* Stage dots */}
      <div className="mt-2 flex flex-wrap gap-1">
        {stages.slice(0, 5).map((type, i) => {
          const meta = EVENT_CONFIG[type]
          const srcMeta = SOURCE_META[meta.source]
          return (
            <span
              key={i}
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                srcMeta.badge
              )}
            >
              {meta.label}
            </span>
          )
        })}
        {stages.length > 5 && (
          <span className="text-[9px] text-muted-foreground/60">
            +{stages.length - 5} more
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Empty right panel ────────────────────────────────────────────────────────

function IdlePanel({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-indigo-50">
        <TrendingUp className="h-7 w-7 text-brand-indigo-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-brand-navy">
          Select a funnel to view analytics
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Or build a custom funnel to track your exact conversion path
        </p>
      </div>
      <Button size="sm" onClick={onCreate}>
        <Plus className="h-3.5 w-3.5" />
        New Funnel
      </Button>
    </div>
  )
}

// ─── Main page client ─────────────────────────────────────────────────────────

interface FunnelPageClientProps {
  initialFunnels: FunnelDef[]
  eventCounts: Record<string, number>
}

export function FunnelPageClient({ initialFunnels, eventCounts }: FunnelPageClientProps) {
  const [funnels, setFunnels] = useState<FunnelDef[]>(initialFunnels)
  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(null)
  const [panelMode, setPanelMode] = useState<RightPanelMode>("idle")
  const [templateStages, setTemplateStages] = useState<FunnelEventType[] | null>(null)
  const [isPending, startTransition] = useTransition()

  const activeFunnel = funnels.find((f) => f.id === activeFunnelId) ?? null
  const isSystem = activeFunnel?.userId === null

  function openAnalytics(id: string) {
    setActiveFunnelId(id)
    setPanelMode("analytics")
    setTemplateStages(null)
  }

  function openBuilder() {
    setPanelMode("builder")
  }

  function openNewFunnel() {
    setActiveFunnelId(null)
    setPanelMode("builder")
    setTemplateStages(null)
  }

  function openFromTemplate(funnel: FunnelDef) {
    setActiveFunnelId(null)
    setTemplateStages(funnel.stages as FunnelEventType[])
    setPanelMode("builder")
  }

  function handleCancel() {
    if (activeFunnelId) {
      setPanelMode("analytics")
    } else {
      setPanelMode("idle")
    }
    setTemplateStages(null)
  }

  async function handleSave({
    name,
    description,
    stages,
  }: {
    name: string
    description: string
    stages: FunnelEventType[]
  }) {
    const isEditing = activeFunnelId !== null && !isSystem

    startTransition(async () => {
      const url = isEditing ? `/api/funnels/${activeFunnelId}` : "/api/funnels"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, stages }),
      })

      if (!res.ok) return

      const saved = (await res.json()) as FunnelDef

      if (isEditing) {
        setFunnels((prev) => prev.map((f) => (f.id === saved.id ? saved : f)))
      } else {
        setFunnels((prev) => [...prev, saved])
        setActiveFunnelId(saved.id)
      }
      setPanelMode("analytics")
      setTemplateStages(null)
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/funnels/${id}`, { method: "DELETE" })
      if (!res.ok) return
      setFunnels((prev) => prev.filter((f) => f.id !== id))
      if (activeFunnelId === id) {
        setActiveFunnelId(null)
        setPanelMode("idle")
      }
    })
  }

  const userFunnels = funnels.filter((f) => f.userId !== null)
  const systemFunnels = funnels.filter((f) => f.userId === null)

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-4 animate-fade-in">
      {/* Left: funnel list */}
      <div className="flex w-64 shrink-0 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-surface-card p-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Your Funnels
          </p>
          <button
            onClick={openNewFunnel}
            className="rounded-md p-1 text-muted-foreground hover:bg-surface-subtle hover:text-brand-navy transition-colors"
            title="New funnel"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {userFunnels.length === 0 && systemFunnels.length === 0 && (
            <p className="px-1 text-xs text-muted-foreground/60">No funnels yet</p>
          )}

          {userFunnels.map((f) => (
            <FunnelListItem
              key={f.id}
              funnel={f}
              isActive={activeFunnelId === f.id}
              onSelect={() => openAnalytics(f.id)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}

          {systemFunnels.length > 0 && (
            <>
              {userFunnels.length > 0 && (
                <div className="my-2 border-t border-border" />
              )}
              <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                System defaults
              </p>
              {systemFunnels.map((f) => (
                <FunnelListItem
                  key={f.id}
                  funnel={f}
                  isActive={activeFunnelId === f.id}
                  onSelect={() => openAnalytics(f.id)}
                />
              ))}
            </>
          )}
        </div>

        <Button size="sm" className="w-full" onClick={openNewFunnel}>
          <Plus className="h-3.5 w-3.5" />
          New Funnel
        </Button>
      </div>

      {/* Right: main content panel */}
      <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-surface-card p-5">
        {/* Tab-style header when a funnel is selected */}
        {activeFunnel && panelMode !== "builder" && (
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
            <button
              onClick={() => setPanelMode("analytics")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                panelMode === "analytics"
                  ? "bg-brand-indigo-50 text-brand-indigo-600"
                  : "text-muted-foreground hover:text-brand-navy"
              )}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Analytics
            </button>
            {!isSystem && (
              <button
                onClick={openBuilder}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  panelMode === "builder"
                    ? "bg-brand-indigo-50 text-brand-indigo-600"
                    : "text-muted-foreground hover:text-brand-navy"
                )}
              >
                <Wrench className="h-3.5 w-3.5" />
                Edit funnel
              </button>
            )}
          </div>
        )}

        {/* Builder header when in new-funnel mode */}
        {panelMode === "builder" && !activeFunnel && (
          <div className="mb-4 border-b border-border pb-3">
            <p className="text-base font-semibold text-brand-navy">New Funnel</p>
            <p className="text-xs text-muted-foreground">
              Choose integration events to define your conversion path
            </p>
          </div>
        )}

        {/* Panel content */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {panelMode === "idle" && (
            <IdlePanel onCreate={openNewFunnel} />
          )}

          {panelMode === "analytics" && activeFunnel && (
            <FunnelAnalyticsView
              funnel={activeFunnel}
              eventCounts={eventCounts}
              isSystem={isSystem}
              onEdit={openBuilder}
              onUseAsTemplate={() => openFromTemplate(activeFunnel)}
            />
          )}

          {panelMode === "builder" && (
            <FunnelBuilder
              initialName={
                activeFunnel && !isSystem ? activeFunnel.name : ""
              }
              initialDescription={
                activeFunnel && !isSystem ? (activeFunnel.description ?? "") : ""
              }
              initialStages={
                templateStages ??
                (activeFunnel && !isSystem
                  ? (activeFunnel.stages as FunnelEventType[])
                  : [])
              }
              eventCounts={eventCounts}
              isSaving={isPending}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  )
}
