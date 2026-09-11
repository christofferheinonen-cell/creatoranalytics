"use client"

import { useState, useTransition } from "react"
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  Save,
  X,
  GitFork,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Event catalogue ──────────────────────────────────────────────────────────

type EventType =
  | "COMMENT" | "DM_STARTED" | "FREEBIE_CLAIMED" | "LINK_CLICKED"
  | "SUBSCRIBED" | "UNSUBSCRIBED"
  | "CALL_SCHEDULED" | "CALL_COMPLETED" | "CALL_NO_SHOW"
  | "PURCHASED" | "REFUNDED"

interface EventDef {
  type: EventType
  label: string
  desc: string
  integration: string
}

interface IntegrationCatalogue {
  label: string
  dot: string
  chip: string
  events: EventDef[]
}

const CATALOGUE: Record<string, IntegrationCatalogue> = {
  MANYCHAT: {
    label: "ManyChat",
    dot: "bg-sky-500",
    chip: "bg-sky-50 text-sky-700",
    events: [
      { type: "COMMENT",        label: "Social Comment",  desc: "User comments on a post",         integration: "MANYCHAT" },
      { type: "DM_STARTED",     label: "DM Started",      desc: "Bot DM conversation begins",       integration: "MANYCHAT" },
      { type: "FREEBIE_CLAIMED",label: "Freebie Claimed", desc: "Lead magnet delivered via DM",     integration: "MANYCHAT" },
      { type: "LINK_CLICKED",   label: "Link Clicked",    desc: "Tracked link clicked in DM",       integration: "MANYCHAT" },
    ],
  },
  KIT: {
    label: "Kit",
    dot: "bg-orange-500",
    chip: "bg-orange-50 text-orange-700",
    events: [
      { type: "SUBSCRIBED",   label: "Email Subscribed", desc: "Contact joins email list",    integration: "KIT" },
      { type: "UNSUBSCRIBED", label: "Unsubscribed",     desc: "Contact leaves email list",   integration: "KIT" },
    ],
  },
  CALENDLY: {
    label: "Calendly",
    dot: "bg-teal-500",
    chip: "bg-teal-50 text-teal-700",
    events: [
      { type: "CALL_SCHEDULED", label: "Call Booked",    desc: "Discovery call scheduled",    integration: "CALENDLY" },
      { type: "CALL_COMPLETED", label: "Call Completed", desc: "Call took place",              integration: "CALENDLY" },
      { type: "CALL_NO_SHOW",   label: "No Show",        desc: "Invitee didn't attend",       integration: "CALENDLY" },
    ],
  },
  STRIPE: {
    label: "Stripe",
    dot: "bg-violet-500",
    chip: "bg-violet-50 text-violet-700",
    events: [
      { type: "PURCHASED", label: "Purchased", desc: "Payment collected",   integration: "STRIPE" },
      { type: "REFUNDED",  label: "Refunded",  desc: "Payment refunded",    integration: "STRIPE" },
    ],
  },
}

const ALL_EVENTS: EventDef[] = Object.values(CATALOGUE).flatMap((c) => c.events)

// ── Saved funnel shape ────────────────────────────────────────────────────────

export interface SavedFunnel {
  id: string
  name: string
  description: string | null
  stages: string[]
  isDefault: boolean
  userId: string | null
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IntegrationChip({ integration }: { integration: string }) {
  const cat = CATALOGUE[integration]
  if (!cat) return null
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", cat.chip)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cat.dot)} />
      {cat.label}
    </span>
  )
}

function StageNode({
  event,
  index,
  total,
  onMove,
  onRemove,
}: {
  event: EventDef
  index: number
  total: number
  onMove: (dir: "up" | "down") => void
  onRemove: () => void
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <div className="flex w-full items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5 shadow-sm">
        {/* Step number */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[11px] font-bold text-[#64748B]">
          {index + 1}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-brand-navy">{event.label}</p>
          <p className="text-[11px] text-muted-foreground">{event.desc}</p>
        </div>

        {/* Integration chip */}
        <IntegrationChip integration={event.integration} />

        {/* Controls */}
        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={() => onMove("up")}
            disabled={index === 0}
            className="rounded p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-brand-navy disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onMove("down")}
            disabled={index === total - 1}
            className="rounded p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-brand-navy disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors ml-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Connector arrow */}
      {index < total - 1 && (
        <div className="flex flex-col items-center py-1">
          <div className="h-4 w-px bg-[#CBD5E1]" />
          <ArrowDown className="h-3 w-3 text-[#CBD5E1]" />
        </div>
      )}
    </div>
  )
}

// ── Funnel card in the list ───────────────────────────────────────────────────

function FunnelCard({
  funnel,
  isActive,
  onSelect,
  onDelete,
}: {
  funnel: SavedFunnel
  isActive: boolean
  onSelect: () => void
  onDelete?: () => void
}) {
  const stages = funnel.stages
    .map((s) => ALL_EVENTS.find((e) => e.type === s))
    .filter(Boolean) as EventDef[]

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border px-4 py-3.5 text-left transition-colors",
        isActive
          ? "border-brand-indigo-300 bg-brand-indigo-50"
          : "border-[#E2E8F0] bg-white hover:border-brand-indigo-200 hover:bg-[#F8FAFC]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-brand-navy truncate">{funnel.name}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {funnel.stages.length} stages
            {funnel.isDefault && (
              <span className="ml-2 rounded-full bg-[#F1F5F9] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#64748B]">
                Default
              </span>
            )}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="shrink-0 rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Stage pills */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {stages.map((s) => (
          <IntegrationChip key={s.type} integration={s.integration} />
        ))}
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function FunnelBuilder({ initialFunnels }: { initialFunnels: SavedFunnel[] }) {
  const [funnels, setFunnels] = useState<SavedFunnel[]>(initialFunnels)
  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Builder state
  const [name, setName] = useState("")
  const [stages, setStages] = useState<EventDef[]>([])
  const [activeTab, setActiveTab] = useState<string>("MANYCHAT")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function startNew() {
    setIsCreating(true)
    setActiveFunnelId(null)
    setName("")
    setStages([])
    setError(null)
  }

  function addStage(event: EventDef) {
    setStages((prev) => [...prev, event])
  }

  function removeStage(i: number) {
    setStages((prev) => prev.filter((_, idx) => idx !== i))
  }

  function moveStage(i: number, dir: "up" | "down") {
    setStages((prev) => {
      const next = [...prev]
      const swap = dir === "up" ? i - 1 : i + 1
      ;[next[i], next[swap]] = [next[swap], next[i]]
      return next
    })
  }

  function saveFunnel() {
    if (!name.trim()) { setError("Give your funnel a name."); return }
    if (stages.length < 2) { setError("Add at least 2 stages."); return }
    setError(null)

    startTransition(async () => {
      const res = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), stages: stages.map((s) => s.type) }),
      })
      if (!res.ok) { setError("Failed to save. Try again."); return }
      const saved: SavedFunnel = await res.json()
      setFunnels((prev) => [...prev, saved])
      setIsCreating(false)
      setActiveFunnelId(saved.id)
    })
  }

  function deleteFunnel(id: string) {
    startTransition(async () => {
      await fetch(`/api/funnels?id=${id}`, { method: "DELETE" })
      setFunnels((prev) => prev.filter((f) => f.id !== id))
      if (activeFunnelId === id) setActiveFunnelId(null)
      if (isCreating) setIsCreating(false)
    })
  }

  const activeFunnel = funnels.find((f) => f.id === activeFunnelId) ?? null

  return (
    <div className="flex gap-6">
      {/* ── Left panel: funnel list ── */}
      <div className="flex w-[260px] shrink-0 flex-col gap-3">
        <button
          onClick={startNew}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand-indigo-300 bg-brand-indigo-50 px-4 py-3 text-[13px] font-semibold text-brand-indigo-600 hover:bg-brand-indigo-100 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Funnel
        </button>

        {funnels.map((f) => (
          <FunnelCard
            key={f.id}
            funnel={f}
            isActive={activeFunnelId === f.id}
            onSelect={() => { setActiveFunnelId(f.id); setIsCreating(false) }}
            onDelete={f.userId ? () => deleteFunnel(f.id) : undefined}
          />
        ))}
      </div>

      {/* ── Right panel: detail / builder ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">

        {/* Empty state */}
        {!isCreating && !activeFunnel && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] py-20 text-center">
            <GitFork className="mb-3 h-8 w-8 text-[#CBD5E1]" />
            <p className="text-[13px] font-semibold text-brand-navy">No funnel selected</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Select a funnel from the left or create a new one.
            </p>
          </div>
        )}

        {/* Funnel detail view (read-only for now) */}
        {!isCreating && activeFunnel && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">{activeFunnel.name}</h2>
              {activeFunnel.description && (
                <p className="mt-1 text-sm text-muted-foreground">{activeFunnel.description}</p>
              )}
            </div>
            <div className="flex flex-col">
              {(activeFunnel.stages
                .map((s) => ALL_EVENTS.find((e) => e.type === s))
                .filter(Boolean) as EventDef[]).map((event, i, arr) => (
                <StageNode
                  key={i}
                  event={event}
                  index={i}
                  total={arr.length}
                  onMove={() => {}}
                  onRemove={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Builder */}
        {isCreating && (
          <div className="flex gap-6">
            {/* Canvas */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-brand-navy">
                  Funnel name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Freebie → Purchase"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-brand-navy placeholder:text-[#94A3B8] focus:border-brand-indigo-400 focus:outline-none focus:ring-1 focus:ring-brand-indigo-400"
                />
              </div>

              {/* Nodes */}
              {stages.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] py-16 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    Add events from the palette →
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {stages.map((event, i) => (
                    <StageNode
                      key={i}
                      event={event}
                      index={i}
                      total={stages.length}
                      onMove={(dir) => moveStage(i, dir)}
                      onRemove={() => removeStage(i)}
                    />
                  ))}
                </div>
              )}

              {error && (
                <p className="text-[12px] font-medium text-red-500">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={saveFunnel}
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-brand-indigo-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-indigo-600 disabled:opacity-60 transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isPending ? "Saving…" : "Save Funnel"}
                </button>
                <button
                  onClick={() => { setIsCreating(false); setStages([]); setName("") }}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-[#F1F5F9] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Event palette */}
            <div className="w-[220px] shrink-0">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Events
              </p>

              {/* Integration tabs */}
              <div className="mb-3 flex flex-wrap gap-1">
                {Object.entries(CATALOGUE).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      activeTab === key
                        ? "bg-brand-navy text-white"
                        : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Event cards */}
              <div className="flex flex-col gap-2">
                {CATALOGUE[activeTab]?.events.map((event) => {
                  const cat = CATALOGUE[activeTab]
                  return (
                    <button
                      key={event.type}
                      onClick={() => addStage(event)}
                      className="flex w-full flex-col gap-0.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-left hover:border-brand-indigo-200 hover:bg-brand-indigo-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-brand-navy">{event.label}</p>
                        <Plus className="h-3 w-3 text-[#CBD5E1] group-hover:text-brand-indigo-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{event.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
