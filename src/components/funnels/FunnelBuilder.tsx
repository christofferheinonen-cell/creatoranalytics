"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  X,
  MessageCircle,
  Mail,
  Calendar,
  CreditCard,
  GitBranch,
  DollarSign,
  Phone,
  UserCheck,
  MessageSquare,
  Zap,
  Save,
  MousePointerClick,
  Gift,
  UserMinus,
  RotateCcw,
  PhoneMissed,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MockBuilderNode, MockNodeType } from "@/lib/mock-data"

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_W = 240
const NODE_H = 86

const NODE_CFG: Record<MockNodeType, {
  label: string
  color: string
  headerBg: string
  dot: string
  ring: string
}> = {
  manychat:  { label: "ManyChat",  color: "#2563EB", headerBg: "#EFF6FF", dot: "#3B82F6", ring: "#60A5FA" },
  kit:       { label: "Kit",       color: "#059669", headerBg: "#ECFDF5", dot: "#10B981", ring: "#34D399" },
  calendly:  { label: "Calendly",  color: "#D97706", headerBg: "#FFFBEB", dot: "#F59E0B", ring: "#FCD34D" },
  stripe:    { label: "Stripe",    color: "#7C3AED", headerBg: "#F5F3FF", dot: "#8B5CF6", ring: "#A78BFA" },
  condition: { label: "Filter",    color: "#B45309", headerBg: "#FEF3C7", dot: "#D97706", ring: "#FBBF24" },
  goal:      { label: "Goal",      color: "#DB2777", headerBg: "#FDF2F8", dot: "#EC4899", ring: "#F472B6" },
}

// ─── Palette definition ───────────────────────────────────────────────────────

interface PaletteItem {
  type: MockNodeType
  title: string
  subtitle: string
  Icon: React.ElementType
  eventType: string | null
}

const PALETTE: { category: string; items: PaletteItem[] }[] = [
  {
    category: "ManyChat",
    items: [
      { type: "manychat", title: "Instagram Comment", subtitle: "Keyword-triggered comment", Icon: MessageSquare,     eventType: "COMMENT"         },
      { type: "manychat", title: "DM Started",        subtitle: "Contact opened a DM",       Icon: MessageCircle,     eventType: "DM_STARTED"      },
      { type: "manychat", title: "Freebie Claimed",   subtitle: "Link opened in DM",         Icon: Gift,              eventType: "FREEBIE_CLAIMED" },
      { type: "manychat", title: "Link Clicked",      subtitle: "Video or URL clicked",      Icon: MousePointerClick, eventType: "LINK_CLICKED"    },
    ],
  },
  {
    category: "Kit",
    items: [
      { type: "kit", title: "Email Subscribed",   subtitle: "Added to a Kit sequence", Icon: UserCheck, eventType: "SUBSCRIBED"   },
      { type: "kit", title: "Email Unsubscribed", subtitle: "Removed from Kit list",   Icon: UserMinus, eventType: "UNSUBSCRIBED" },
    ],
  },
  {
    category: "Calendly",
    items: [
      { type: "calendly", title: "Call Scheduled", subtitle: "Booking confirmed",         Icon: Calendar,    eventType: "CALL_SCHEDULED" },
      { type: "calendly", title: "Call Completed", subtitle: "Appointment attended",      Icon: Phone,       eventType: "CALL_COMPLETED" },
      { type: "calendly", title: "No-Show",        subtitle: "Contact missed the call",   Icon: PhoneMissed, eventType: "CALL_NO_SHOW"   },
    ],
  },
  {
    category: "Stripe",
    items: [
      { type: "stripe", title: "Purchase Made", subtitle: "Payment confirmed", Icon: CreditCard, eventType: "PURCHASED" },
      { type: "stripe", title: "Refund Issued", subtitle: "Charge reversed",   Icon: RotateCcw,  eventType: "REFUNDED"  },
    ],
  },
  {
    category: "Analytics",
    items: [
      { type: "goal",      title: "Conversion Goal",  subtitle: "Mark this as your goal",       Icon: DollarSign, eventType: null },
      { type: "condition", title: "Filter / Segment", subtitle: "Split tracking by condition",  Icon: GitBranch,  eventType: null },
    ],
  },
]

// Quick-add menu shown when clicking "+" on a node
const QUICK_ADD: { group: string; items: PaletteItem[] }[] = [
  {
    group: "ManyChat events",
    items: [
      { type: "manychat", title: "DM Started",     subtitle: "Contact opened a DM",  Icon: MessageCircle,     eventType: "DM_STARTED"      },
      { type: "manychat", title: "Freebie Claimed", subtitle: "Link opened in DM",    Icon: Gift,              eventType: "FREEBIE_CLAIMED" },
      { type: "manychat", title: "Link Clicked",    subtitle: "Video or URL clicked", Icon: MousePointerClick, eventType: "LINK_CLICKED"    },
    ],
  },
  {
    group: "Kit events",
    items: [
      { type: "kit", title: "Email Subscribed", subtitle: "Added to Kit sequence", Icon: UserCheck, eventType: "SUBSCRIBED" },
    ],
  },
  {
    group: "Calendly events",
    items: [
      { type: "calendly", title: "Call Scheduled", subtitle: "Booking confirmed",    Icon: Calendar, eventType: "CALL_SCHEDULED" },
      { type: "calendly", title: "Call Completed", subtitle: "Appointment attended", Icon: Phone,    eventType: "CALL_COMPLETED" },
    ],
  },
  {
    group: "Stripe events",
    items: [
      { type: "stripe", title: "Purchase Made", subtitle: "Payment confirmed", Icon: CreditCard, eventType: "PURCHASED" },
    ],
  },
  {
    group: "Analytics",
    items: [
      { type: "goal",      title: "Conversion Goal",  subtitle: "Mark as goal",        Icon: DollarSign, eventType: null },
      { type: "condition", title: "Filter / Segment", subtitle: "Split by condition",  Icon: GitBranch,  eventType: null },
    ],
  },
]

// ─── Types ─────────────────────────────────────────────────────────────────────

type DragState =
  | { kind: "node"; nodeId: string; startMX: number; startMY: number; startNX: number; startNY: number }
  | { kind: "canvas"; startMX: number; startMY: number; startPX: number; startPY: number }
  | null

interface AddMenu {
  fromNodeId: string
  canvasX: number
  canvasY: number
}

// ─── Node component ────────────────────────────────────────────────────────────

function FlowNode({
  node,
  panX,
  panY,
  isSelected,
  isConnecting,
  onMouseDown,
  onNodeClick,
  onConnectStart,
  onPlusClick,
  onDelete,
}: {
  node: MockBuilderNode
  panX: number
  panY: number
  isSelected: boolean
  isConnecting: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onNodeClick: (e: React.MouseEvent) => void
  onConnectStart: (e: React.MouseEvent) => void
  onPlusClick: (e: React.MouseEvent) => void
  onDelete: () => void
}) {
  const cfg = NODE_CFG[node.type]
  const screenX = node.x + panX
  const screenY = node.y + panY

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${screenX}px, ${screenY}px)`,
        width: NODE_W,
        zIndex: isSelected ? 20 : 2,
      }}
      className="group/node"
    >
      {/* Input handle (left) */}
      <div
        style={{ backgroundColor: cfg.dot }}
        className="absolute -left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm z-10"
      />

      {/* Card */}
      <div
        onMouseDown={onMouseDown}
        onClick={onNodeClick}
        style={{
          borderColor: isSelected ? "#6366F1" : isConnecting ? cfg.ring : "transparent",
          boxShadow: isSelected
            ? "0 0 0 2px #6366F120, 0 4px 12px rgb(0 0 0 / 0.10)"
            : "0 1px 4px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.05)",
        }}
        className={cn(
          "relative rounded-xl border-2 bg-white transition-shadow cursor-grab active:cursor-grabbing select-none",
          "hover:shadow-card-hover"
        )}
      >
        {/* Header */}
        <div
          style={{ backgroundColor: cfg.headerBg }}
          className="flex items-center gap-2 px-3 py-2 rounded-t-[10px]"
        >
          <div
            style={{ backgroundColor: cfg.color }}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
          >
            {node.type === "manychat"  && <MessageSquare className="h-2.5 w-2.5 text-white" />}
            {node.type === "kit"       && <Mail className="h-2.5 w-2.5 text-white" />}
            {node.type === "calendly"  && <Calendar className="h-2.5 w-2.5 text-white" />}
            {node.type === "stripe"    && <CreditCard className="h-2.5 w-2.5 text-white" />}
            {node.type === "goal"      && <DollarSign className="h-2.5 w-2.5 text-white" />}
            {node.type === "condition" && <GitBranch className="h-2.5 w-2.5 text-white" />}
          </div>
          <span
            style={{ color: cfg.color }}
            className="text-[10px] font-bold uppercase tracking-widest"
          >
            {cfg.label}
          </span>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5">
          <p className="text-sm font-semibold text-brand-navy leading-snug">{node.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{node.subtitle}</p>
        </div>
      </div>

      {/* Output handle + connect dot (right) */}
      <button
        onMouseDown={(e) => { e.stopPropagation(); onConnectStart(e) }}
        style={{ backgroundColor: cfg.dot }}
        className="absolute -right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm z-10 cursor-crosshair hover:scale-125 transition-transform"
        title="Drag to connect"
      />

      {/* Plus button below node */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ top: NODE_H }}>
        <div className="h-4 w-px" style={{ backgroundColor: cfg.dot + "60" }} />
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onPlusClick(e) }}
          style={{ borderColor: cfg.dot }}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white shadow-sm hover:scale-110 transition-transform z-10"
          title="Add next step"
        >
          <Plus className="h-3 w-3" style={{ color: cfg.dot }} />
        </button>
      </div>

      {/* Delete button (visible when selected) */}
      {isSelected && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition-colors z-30"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

// ─── Quick-add menu ────────────────────────────────────────────────────────────

function QuickAddMenu({
  x,
  y,
  onSelect,
  onDismiss,
}: {
  x: number
  y: number
  onSelect: (item: PaletteItem) => void
  onDismiss: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onMouseDown={onDismiss} />
      <div
        style={{ position: "absolute", left: x, top: y, zIndex: 50, width: 248 }}
        className="rounded-xl border border-border bg-white shadow-panel overflow-hidden"
      >
        <div className="border-b border-border px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Add next step
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {QUICK_ADD.map((group) => (
            <div key={group.group}>
              <p className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {group.group}
              </p>
              {group.items.map((item) => {
                const Icon = item.Icon
                const cfg = NODE_CFG[item.type]
                return (
                  <button
                    key={item.title}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => onSelect(item)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-subtle transition-colors"
                  >
                    <div
                      style={{ backgroundColor: cfg.headerBg }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-brand-navy">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Main builder ──────────────────────────────────────────────────────────────

export function FunnelBuilder({
  initialNodes,
  funnelName: initialName,
  funnelId: initialFunnelId = null,
  funnelStatus: initialStatus = "DRAFT",
}: {
  initialNodes: MockBuilderNode[]
  funnelName: string
  funnelId?: string | null
  funnelStatus?: "DRAFT" | "ACTIVE" | "ARCHIVED"
}) {
  const router = useRouter()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<MockBuilderNode[]>(initialNodes)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [drag, setDrag] = useState<DragState>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [mouseCanvasX, setMouseCanvasX] = useState(0)
  const [mouseCanvasY, setMouseCanvasY] = useState(0)
  const [addMenu, setAddMenu] = useState<AddMenu | null>(null)
  const [funnelName, setFunnelName] = useState(initialName)
  const [funnelId, setFunnelId] = useState<string | null>(initialFunnelId)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "ARCHIVED">(initialStatus)
  const [view, setView] = useState<"build" | "analytics">("build")
  const [analyticsData, setAnalyticsData] = useState<{ eventType: string; label: string; source: string; count: number }[] | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Dismiss menu / cancel connecting on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAddMenu(null)
        setConnectingFrom(null)
        setSelectedId(null)
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        handleDeleteNode(selectedId)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev
        .filter((n) => n.id !== nodeId)
        .map((n) => ({ ...n, outputs: n.outputs.filter((id) => id !== nodeId) }))
    )
    setSelectedId(null)
  }, [])

  // ── Mouse handlers ─────────────────────────────────────────────────────────

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element).closest(".flow-node")) return
    setDrag({ kind: "canvas", startMX: e.clientX, startMY: e.clientY, startPX: panX, startPY: panY })
    setSelectedId(null)
    setAddMenu(null)
    if (connectingFrom) setConnectingFrom(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    // Track mouse for ghost line
    if (canvasRef.current) {
      const r = canvasRef.current.getBoundingClientRect()
      setMouseCanvasX(e.clientX - r.left)
      setMouseCanvasY(e.clientY - r.top)
    }

    if (!drag) return

    if (drag.kind === "node") {
      const dx = e.clientX - drag.startMX
      const dy = e.clientY - drag.startMY
      setNodes((prev) =>
        prev.map((n) =>
          n.id === drag.nodeId ? { ...n, x: drag.startNX + dx, y: drag.startNY + dy } : n
        )
      )
    }

    if (drag.kind === "canvas") {
      const dx = e.clientX - drag.startMX
      const dy = e.clientY - drag.startMY
      setPanX(drag.startPX + dx)
      setPanY(drag.startPY + dy)
    }
  }

  const handleMouseUp = () => setDrag(null)

  const handleNodeMouseDown = (e: React.MouseEvent, node: MockBuilderNode) => {
    e.stopPropagation()
    setDrag({ kind: "node", nodeId: node.id, startMX: e.clientX, startMY: e.clientY, startNX: node.x, startNY: node.y })
    setSelectedId(node.id)
    setAddMenu(null)
  }

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    if (connectingFrom && connectingFrom !== nodeId) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === connectingFrom && !n.outputs.includes(nodeId)
            ? { ...n, outputs: [...n.outputs, nodeId] }
            : n
        )
      )
      setConnectingFrom(null)
    }
  }

  const handleConnectStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    setConnectingFrom(nodeId)
    setAddMenu(null)
  }

  const handlePlusClick = (e: React.MouseEvent, node: MockBuilderNode) => {
    e.stopPropagation()
    const menuX = node.x + panX + NODE_W + 16
    const menuY = node.y + panY + NODE_H / 2 - 80
    setAddMenu({ fromNodeId: node.id, canvasX: menuX, canvasY: menuY })
    setConnectingFrom(null)
  }

  const handleQuickAddSelect = (item: PaletteItem) => {
    if (!addMenu) return
    const fromNode = nodes.find((n) => n.id === addMenu.fromNodeId)
    if (!fromNode) return
    const newId = `node-${Date.now()}`
    const newNode: MockBuilderNode = {
      id: newId,
      type: item.type,
      x: fromNode.x + NODE_W + 80,
      y: fromNode.y,
      title: item.title,
      subtitle: item.subtitle,
      outputs: [],
      eventType: item.eventType,
    }
    setNodes((prev) => [
      ...prev.map((n) =>
        n.id === addMenu.fromNodeId ? { ...n, outputs: [...n.outputs, newId] } : n
      ),
      newNode,
    ])
    setAddMenu(null)
  }

  const addNodeFromPalette = (item: PaletteItem) => {
    const canvas = canvasRef.current
    const cx = canvas ? canvas.clientWidth / 2 - panX - NODE_W / 2 : 200
    const cy = canvas ? canvas.clientHeight / 2 - panY - NODE_H / 2 : 200
    setNodes((prev) => [
      ...prev,
      { id: `node-${Date.now()}`, type: item.type, x: cx, y: cy, title: item.title, subtitle: item.subtitle, outputs: [], eventType: item.eventType },
    ])
  }

  const handleSave = useCallback(async () => {
    if (saveState === "saving") return
    setSaveState("saving")
    try {
      if (funnelId) {
        await fetch(`/api/funnels/${funnelId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: funnelName, nodes }),
        }).then((r) => { if (!r.ok) throw new Error("Save failed") })
      } else {
        const res = await fetch("/api/funnels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: funnelName, nodes }),
        })
        if (!res.ok) throw new Error("Create failed")
        const data = await res.json()
        setFunnelId(data.id)
        router.replace(`/funnels/${data.id}`)
      }
      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 2000)
    } catch {
      setSaveState("error")
      setTimeout(() => setSaveState("idle"), 3000)
    }
  }, [funnelId, funnelName, nodes, saveState, router])

  const handleToggleStatus = useCallback(async () => {
    if (!funnelId) return
    const next = status === "ACTIVE" ? "DRAFT" : "ACTIVE"
    setStatus(next)
    await fetch(`/api/funnels/${funnelId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    })
  }, [funnelId, status])

  const fetchAnalytics = useCallback(async (currentNodes: MockBuilderNode[]) => {
    // Extract stages from node graph — same logic as server-side extractFunnelStages
    const hasIncoming = new Set(currentNodes.flatMap((n) => n.outputs))
    const roots = currentNodes.filter((n) => !hasIncoming.has(n.id))
    const startNodes = roots.length > 0 ? roots : currentNodes.slice(0, 1)

    const visited = new Set<string>()
    const stages: { eventType: string; label: string; source: string }[] = []

    function walk(nodeId: string) {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      const node = currentNodes.find((n) => n.id === nodeId)
      if (!node) return
      if (node.eventType) stages.push({ eventType: node.eventType, label: node.title, source: node.type })
      for (const outId of node.outputs) walk(outId)
    }
    for (const root of startNodes) walk(root.id)

    if (!stages.length) {
      setAnalyticsData([])
      return
    }

    setAnalyticsLoading(true)
    try {
      const res = await fetch("/api/funnels/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages }),
      })
      if (!res.ok) throw new Error("Failed to load analytics")
      const data = await res.json()
      setAnalyticsData(data.stages)
    } catch {
      setAnalyticsData(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  // Fetch analytics whenever the user switches to the analytics view
  useEffect(() => {
    if (view === "analytics") {
      fetchAnalytics(nodes)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  // ── Compute SVG connections ────────────────────────────────────────────────

  const connections = nodes.flatMap((node) =>
    node.outputs
      .map((targetId) => {
        const to = nodes.find((n) => n.id === targetId)
        return to ? { from: node, to } : null
      })
      .filter(Boolean)
  ) as { from: MockBuilderNode; to: MockBuilderNode }[]

  const ghostFrom = connectingFrom ? nodes.find((n) => n.id === connectingFrom) : null

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ── Left palette ──────────────────────────────────────────────── */}
      <aside className="flex w-[268px] shrink-0 flex-col border-r border-border bg-surface-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Blocks
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {PALETTE.map((group) => (
            <div key={group.category} className="mb-1">
              <p className="px-4 pt-3 pb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {group.category}
              </p>
              {group.items.map((item) => {
                const Icon = item.Icon
                const cfg = NODE_CFG[item.type]
                return (
                  <button
                    key={item.title}
                    onClick={() => addNodeFromPalette(item)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface-subtle transition-colors"
                  >
                    <div
                      style={{ backgroundColor: cfg.headerBg }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    >
                      <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-brand-navy">{item.title}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right: toolbar + canvas ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-surface-card px-4">
          <Link
            href="/funnels"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-surface-subtle hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Funnels
          </Link>

          <div className="h-4 w-px bg-border" />

          <input
            value={funnelName}
            onChange={(e) => setFunnelName(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold text-brand-navy outline-none placeholder:text-muted-foreground"
            placeholder="Untitled Funnel"
          />

          {/* Build / Analytics toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-[11px] font-semibold shrink-0">
            <button
              onClick={() => setView("build")}
              className={cn(
                "px-3 py-1 transition-colors",
                view === "build" ? "bg-brand-navy text-white" : "text-muted-foreground hover:bg-surface-subtle"
              )}
            >
              Build
            </button>
            <button
              onClick={() => setView("analytics")}
              className={cn(
                "px-3 py-1 border-l border-border transition-colors",
                view === "analytics" ? "bg-brand-navy text-white" : "text-muted-foreground hover:bg-surface-subtle"
              )}
            >
              Analytics
            </button>
          </div>

          {view === "build" && connectingFrom && (
            <span className="rounded-full bg-brand-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-brand-indigo-600">
              Click a node to connect · Esc to cancel
            </span>
          )}

          {funnelId && (
            <button
              onClick={handleToggleStatus}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border-none cursor-pointer shrink-0",
                status === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              )}
            >
              {status === "ACTIVE" ? "● Active" : "○ Draft"}
            </button>
          )}

          {view === "build" && (
            <button
              onClick={handleSave}
              disabled={saveState === "saving"}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 shrink-0",
                saveState === "saved"
                  ? "bg-emerald-100 text-emerald-700"
                  : saveState === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-brand-indigo-500 text-white hover:bg-brand-indigo-600"
              )}
            >
              <Save className="h-3.5 w-3.5" />
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved!" : saveState === "error" ? "Error" : "Save"}
            </button>
          )}
        </div>

        {/* Analytics panel */}
        {view === "analytics" && (
          <div className="flex-1 overflow-y-auto p-8">
            {analyticsLoading && (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Loading analytics…
              </div>
            )}
            {!analyticsLoading && analyticsData !== null && analyticsData.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
                <p className="text-sm font-medium text-brand-navy">No trackable stages in this funnel</p>
                <p className="text-xs text-muted-foreground">Add ManyChat, Kit, Calendly or Stripe events to see analytics.</p>
              </div>
            )}
            {!analyticsLoading && analyticsData && analyticsData.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-base font-bold text-brand-navy">{funnelName}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Distinct contacts who reached each stage · all time
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-surface-card overflow-hidden">
                  {analyticsData.map((stage, i) => {
                    const top = analyticsData[0]?.count ?? 0
                    const pct = top > 0 ? Math.round((stage.count / top) * 100) : 0
                    const prevCount = i > 0 ? analyticsData[i - 1].count : stage.count
                    const dropPct = prevCount > 0 ? Math.round(((prevCount - stage.count) / prevCount) * 100) : 0
                    const SOURCE_COLOR: Record<string, string> = {
                      manychat: "#2563EB", kit: "#059669", calendly: "#D97706",
                      stripe: "#7C3AED", goal: "#DB2777", condition: "#B45309",
                    }
                    const color = SOURCE_COLOR[stage.source] ?? "#6366F1"

                    return (
                      <div
                        key={stage.eventType}
                        className="flex items-center gap-4 px-5 py-4"
                        style={{ borderTop: i > 0 ? "1px solid var(--card-border)" : "none" }}
                      >
                        <span className="text-[11px] font-bold text-muted-foreground w-5 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-semibold text-brand-navy">{stage.label}</span>
                            <span
                              className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5"
                              style={{ background: color + "18", color }}
                            >
                              {stage.source}
                            </span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${Math.max(pct, 2)}%`, background: color }}
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0 w-24">
                          <span className="text-base font-bold text-brand-navy">{stage.count.toLocaleString()}</span>
                          <div className="text-[11px] text-muted-foreground">
                            {pct}% of top
                            {i > 0 && dropPct > 0 && (
                              <span className="ml-1 text-red-500">↓{dropPct}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => fetchAnalytics(nodes)}
                  className="mt-4 text-xs text-muted-foreground hover:text-brand-navy transition-colors"
                >
                  ↻ Refresh
                </button>
              </div>
            )}
            {!analyticsLoading && analyticsData === null && (
              <div className="flex items-center justify-center h-48 text-sm text-red-500">
                Failed to load analytics. Check your connection.
              </div>
            )}
          </div>
        )}

        {/* Canvas */}
        {view === "build" && <div
          ref={canvasRef}
          className="relative flex-1 overflow-hidden"
          style={{ cursor: drag?.kind === "canvas" ? "grabbing" : connectingFrom ? "crosshair" : "default" }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Dot grid background — moves with pan */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundPosition: `${panX % 24}px ${panY % 24}px`,
            }}
          />

          {/* Empty-state hint */}
          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground/40 font-medium">
                Click a block on the left to start building
              </p>
            </div>
          )}

          {/* SVG layer — connections & ghost */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#6366F1" opacity="0.8" />
              </marker>
              <marker id="arrow-ghost" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#6366F1" opacity="0.4" />
              </marker>
            </defs>

            {/* Real connections */}
            {connections.map(({ from, to }) => {
              const x1 = from.x + panX + NODE_W
              const y1 = from.y + panY + NODE_H / 2
              const x2 = to.x + panX
              const y2 = to.y + panY + NODE_H / 2
              const cx1 = x1 + Math.max(60, Math.abs(x2 - x1) * 0.4)
              const cx2 = x2 - Math.max(60, Math.abs(x2 - x1) * 0.4)
              return (
                <path
                  key={`${from.id}-${to.id}`}
                  d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
                  stroke="#6366F1"
                  strokeWidth={2}
                  strokeOpacity={0.7}
                  fill="none"
                  markerEnd="url(#arrow)"
                />
              )
            })}

            {/* Ghost connection line */}
            {ghostFrom && (
              <path
                d={`M ${ghostFrom.x + panX + NODE_W} ${ghostFrom.y + panY + NODE_H / 2} C ${ghostFrom.x + panX + NODE_W + 80} ${ghostFrom.y + panY + NODE_H / 2}, ${mouseCanvasX - 80} ${mouseCanvasY}, ${mouseCanvasX} ${mouseCanvasY}`}
                stroke="#6366F1"
                strokeWidth={2}
                strokeOpacity={0.4}
                strokeDasharray="6 4"
                fill="none"
                markerEnd="url(#arrow-ghost)"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <FlowNode
              key={node.id}
              node={node}
              panX={panX}
              panY={panY}
              isSelected={selectedId === node.id}
              isConnecting={connectingFrom !== null}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onNodeClick={(e) => handleNodeClick(e, node.id)}
              onConnectStart={(e) => handleConnectStart(e, node.id)}
              onPlusClick={(e) => handlePlusClick(e, node)}
              onDelete={() => handleDeleteNode(node.id)}
            />
          ))}

          {/* Quick-add menu */}
          {addMenu && (
            <QuickAddMenu
              x={addMenu.canvasX}
              y={addMenu.canvasY}
              onSelect={handleQuickAddSelect}
              onDismiss={() => setAddMenu(null)}
            />
          )}
        </div>}
      </div>
    </div>
  )
}
