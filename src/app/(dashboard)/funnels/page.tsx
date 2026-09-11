import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FunnelPageClient, type FunnelDef } from "@/components/funnels/FunnelPageClient"

export const metadata: Metadata = { title: "Funnels" }

export default async function FunnelsPage() {
  const session = await auth()
  const userId = session!.user.id

  const [funnelRows, eventCountRows] = await Promise.all([
    prisma.funnelDefinition.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    prisma.funnelEvent.groupBy({
      by: ["type"],
      where: { userId },
      _count: { id: true },
    }),
  ])

  const funnels: FunnelDef[] = funnelRows.map((f) => ({
    id: f.id,
    userId: f.userId,
    name: f.name,
    description: f.description,
    stages: f.stages as string[],
    isDefault: f.isDefault,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }))

  const eventCounts: Record<string, number> = {}
  for (const row of eventCountRows) {
    eventCounts[row.type] = row._count.id
  }

  return <FunnelPageClient initialFunnels={funnels} eventCounts={eventCounts} />
}
