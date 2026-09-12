import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Zap, Phone, ArrowRight } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FunnelChart } from "@/components/dashboard/FunnelChart"
import type { FunnelStage } from "@/types"

export const metadata: Metadata = { title: "Funnels" }

const BUILDER_FUNNELS = [
  {
    id: "freebie-funnel",
    name: "Freebie Funnel",
    description: "Comment → DM → Freebie → Email → Purchase",
    icon: Zap,
    iconColor: "#d97706",
    iconBg: "#fef3c7",
  },
  {
    id: "call-funnel",
    name: "High-Ticket Call Funnel",
    description: "Comment → DM → VSL → Discovery Call → Close",
    icon: Phone,
    iconColor: "#7c3aed",
    iconBg: "#ede9fe",
  },
]

export default async function FunnelsPage() {
  const session = await auth()
  const userId = session!.user.id

  const funnelCounts = await prisma.funnelEvent.groupBy({
    by: ["type", "source"],
    where: { userId },
    _count: { id: true },
  })

  const countByType = new Map(funnelCounts.map((r) => [r.type as string, r._count.id]))
  const sourceByType = new Map(funnelCounts.map((r) => [r.type as string, r.source.toLowerCase()]))

  function makeStage(type: string, label: string): FunnelStage | null {
    const count = countByType.get(type)
    if (!count) return null
    return { stage: type, label, count, source: sourceByType.get(type) ?? "" }
  }

  const freebbieFunnel = [
    makeStage("COMMENT", "Social Comment"),
    makeStage("DM_STARTED", "DM Started"),
    makeStage("FREEBIE_CLAIMED", "Freebie Claimed"),
    makeStage("SUBSCRIBED", "Email Subscribed"),
    makeStage("PURCHASED", "Purchased"),
  ].filter(Boolean) as FunnelStage[]

  const callFunnel = [
    makeStage("COMMENT", "Social Comment"),
    makeStage("DM_STARTED", "DM Started"),
    makeStage("LINK_CLICKED", "Video Viewed"),
    makeStage("CALL_SCHEDULED", "Call Booked"),
    makeStage("CALL_COMPLETED", "Call Completed"),
    makeStage("PURCHASED", "Purchased"),
  ].filter(Boolean) as FunnelStage[]

  const combinedFunnel = [
    makeStage("COMMENT", "Social Comment"),
    makeStage("DM_STARTED", "DM Started"),
    makeStage("SUBSCRIBED", "Email Subscribed"),
    makeStage("CALL_SCHEDULED", "Call Booked"),
    makeStage("PURCHASED", "Purchased"),
  ].filter(Boolean) as FunnelStage[]

  return (
    <div className="flex flex-col gap-8" style={{ padding: "28px 28px" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-[28px] font-extrabold tracking-[-0.04em] m-0"
            style={{ color: "var(--text-primary)" }}
          >
            Funnels
          </h1>
          <p className="text-[14px] mt-1 mb-0" style={{ color: "var(--text-tertiary)" }}>
            Build automations and track conversion rates end-to-end.
          </p>
        </div>
        <Link
          href="/funnels/new"
          className="flex items-center gap-2 h-10 px-5 rounded-full text-white text-[13.5px] font-semibold hover:opacity-90 transition-opacity shrink-0"
          style={{ background: "var(--text-primary)" }}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New funnel
        </Link>
      </div>

      {/* Funnel builders */}
      <div>
        <p
          className="text-[10.5px] font-bold tracking-[0.12em] mb-3"
          style={{ color: "var(--text-quaternary)" }}
        >
          FUNNEL BUILDERS
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUILDER_FUNNELS.map((f) => {
            const Icon = f.icon
            return (
              <Link
                key={f.id}
                href={`/funnels/${f.id}`}
                className="group flex flex-col gap-4 rounded-[20px] p-5 hover:opacity-90 transition-all"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  boxShadow: "0 2px 8px rgba(11,11,15,0.05)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: f.iconBg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: f.iconColor }} strokeWidth={1.6} />
                  </div>
                  <ArrowRight
                    className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-tertiary)" }}
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {f.name}
                  </p>
                  <p
                    className="text-[12.5px] mt-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {f.description}
                  </p>
                </div>
                <span
                  className="self-start rounded-full px-3 py-1 text-[11.5px] font-semibold"
                  style={{ background: "var(--topbar-control-bg)", color: "var(--text-secondary)" }}
                >
                  Open builder →
                </span>
              </Link>
            )
          })}

          {/* Create new */}
          <Link
            href="/funnels/new"
            className="flex flex-col items-center justify-center gap-3 rounded-[20px] p-8 text-center hover:opacity-80 transition-all"
            style={{
              background: "var(--topbar-control-bg)",
              border: "2px dashed var(--card-border)",
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "var(--card-border)" }}
            >
              <Plus className="h-5 w-5" style={{ color: "var(--text-tertiary)" }} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>
                Create new funnel
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Start from scratch with a blank canvas
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Analytics */}
      <div>
        <p
          className="text-[10.5px] font-bold tracking-[0.12em] mb-3"
          style={{ color: "var(--text-quaternary)" }}
        >
          CONVERSION ANALYTICS
        </p>
        <FunnelChart
          freebbieFunnel={freebbieFunnel}
          callFunnel={callFunnel}
          combinedFunnel={combinedFunnel}
        />
      </div>
    </div>
  )
}
