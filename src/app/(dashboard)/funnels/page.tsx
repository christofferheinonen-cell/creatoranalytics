import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FunnelBuilder } from "./FunnelBuilder"
import type { SavedFunnel } from "./FunnelBuilder"

export const metadata: Metadata = { title: "Funnels" }

export default async function FunnelsPage() {
  const session = await auth()
  const userId = session!.user.id

  const rawFunnels = await prisma.funnelDefinition.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })

  const funnels: SavedFunnel[] = rawFunnels.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    stages: f.stages as string[],
    isDefault: f.isDefault,
    userId: f.userId,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-navy">Funnels</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Build your funnel by chaining events from your connected integrations.
        </p>
      </div>

      <FunnelBuilder initialFunnels={funnels} />
    </div>
  )
}
