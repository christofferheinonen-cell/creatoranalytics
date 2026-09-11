"use client"

import { useState } from "react"
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  Save,
  X as XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { EVENT_CONFIG, SOURCE_META, EVENTS_BY_SOURCE } from "@/lib/funnel-config"
import type { FunnelEventType, EventSource } from "@/types"

const SOURCE_ORDER: EventSource[] = ["MANYCHAT", "CALENDLY", "KIT", "STRIPE"]

interface FunnelBuilderProps {
  initialName?: string
  initialDescription?: string
  initialStages?: FunnelEventType[]
  eventCounts: Record<string, number>
  isSaving?: boolean
  onSave: (data: { name: string; description: string; stages: FunnelEventType[] }) => void
  onCancel: () => void
}

function SourceBadge({ source }: { source: EventSource }) {
  const meta = SOURCE_META[source]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

export function FunnelBuilder({
  initialName = "",
  initialDescription = "",
  initialStages = [],
  eventCounts,
  isSaving = false,
  onSave,
  onCancel,
}: FunnelBuilderProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [stages, setStages] = useState<FunnelEventType[]>(initialStages)

  function addStage(type: FunnelEventType) {
    setStages((prev) => [...prev, type])
  }

  function removeStage(index: number) {
    setStages((prev) => prev.filter((_, i) => i !== index))
  }

  function moveUp(index: number) {
    if (index === 0) return
    setStages((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function moveDown(index: number) {
    setStages((prev) => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  const canSave = name.trim().length > 0 && stages.length >= 2

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Name + description */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="funnel-name" className="text-xs font-semibold">
            Funnel name
          </Label>
          <Input
            id="funnel-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Freebie → Purchase"
            className="h-8 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="funnel-desc" className="text-xs font-semibold">
            Description
            <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="funnel-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Builder two-column */}
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] gap-4 overflow-hidden">
        {/* Event palette */}
        <div className="flex flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-surface-subtle p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Event Palette
          </p>
          {SOURCE_ORDER.map((source) => (
            <div key={source} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 py-0.5">
                <span className={cn("h-2 w-2 rounded-full", SOURCE_META[source].dot)} />
                <span className="text-[11px] font-semibold text-brand-navy">
                  {SOURCE_META[source].label}
                </span>
              </div>
              {EVENTS_BY_SOURCE[source].map((type) => {
                const meta = EVENT_CONFIG[type]
                const count = eventCounts[type] ?? 0
                return (
                  <button
                    key={type}
                    onClick={() => addStage(type)}
                    className="group flex w-full items-start gap-2 rounded-md border border-transparent bg-surface-card px-2.5 py-2 text-left transition-all hover:border-brand-indigo-200 hover:shadow-sm"
                  >
                    <Plus className="mt-0.5 h-3 w-3 shrink-0 text-brand-indigo-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-brand-navy">{meta.label}</p>
                      {count > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          {count.toLocaleString()} events
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            Click any event to add it to your funnel. Events can be added multiple times.
          </p>
        </div>

        {/* Funnel flow */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          {stages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-16">
              <ArrowDown className="h-6 w-6 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground/50">
                Click events from the palette to build your funnel
              </p>
              <p className="text-xs text-muted-foreground/40">Add at least 2 stages</p>
            </div>
          ) : (
            stages.map((type, i) => {
              const meta = EVENT_CONFIG[type]
              const count = eventCounts[type] ?? 0
              const prevCount = i > 0 ? (eventCounts[stages[i - 1]] ?? 0) : null
              const cvr =
                prevCount !== null && prevCount > 0
                  ? ((count / prevCount) * 100).toFixed(1)
                  : null

              return (
                <div key={`${type}-${i}`}>
                  {/* Connector */}
                  {i > 0 && (
                    <div className="flex items-center gap-1.5 py-1 pl-6">
                      <ArrowDown className="h-3 w-3 text-muted-foreground/40" />
                      {cvr ? (
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {cvr}% converted
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40">↓</span>
                      )}
                    </div>
                  )}

                  {/* Stage node */}
                  <div className="group flex items-center gap-3 rounded-lg border border-border bg-surface-card px-3 py-2.5 shadow-sm transition-shadow hover:shadow-card-hover">
                    {/* Step number */}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-[11px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="text-sm font-medium text-brand-navy">{meta.label}</span>
                      <SourceBadge source={meta.source} />
                      {count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {count.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        className="rounded p-1 text-muted-foreground hover:bg-surface-subtle hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(i)}
                        disabled={i === stages.length - 1}
                        className="rounded p-1 text-muted-foreground hover:bg-surface-subtle hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeStage(i)}
                        className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          {stages.length < 2
            ? "Add at least 2 stages to save"
            : `${stages.length} stages configured`}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <XIcon className="h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onSave({ name, description, stages })}
            disabled={!canSave || isSaving}
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving…" : "Save Funnel"}
          </Button>
        </div>
      </div>
    </div>
  )
}
