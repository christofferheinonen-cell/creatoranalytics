import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FunnelChart } from "@/components/dashboard/FunnelChart"
import type { FunnelStage } from "@/types"

export const metadata: Metadata = { title: "Funnels" }

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
    <div className="flex flex-col gap-5" style={{ padding: "22px" }}>
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.04em] text-cr-black m-0">Funnels</h1>
        <p className="text-[15px] text-cr-text-3 mt-[7px] mb-0">
          Track conversion rates from top of funnel to revenue.
        </p>
      </div>

      <FunnelChart
        freebbieFunnel={freebbieFunnel}
        callFunnel={callFunnel}
        combinedFunnel={combinedFunnel}
      />
    </div>
  )
}
