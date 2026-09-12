import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FunnelBuilder } from "@/components/funnels/FunnelBuilder"
import { MOCK_FUNNELS, MOCK_FUNNEL_NODES } from "@/lib/mock-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const funnel = MOCK_FUNNELS.find((f) => f.id === id)
  return { title: funnel ? `${funnel.name} — Builder` : "New Funnel" }
}

export default async function FunnelBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const funnel = id === "new" ? null : MOCK_FUNNELS.find((f) => f.id === id)

  // Unknown IDs that aren't "new" → 404
  if (id !== "new" && !funnel) notFound()

  const initialNodes = MOCK_FUNNEL_NODES[id] ?? MOCK_FUNNEL_NODES["new"]
  const funnelName = funnel?.name ?? "New Funnel"

  return <FunnelBuilder initialNodes={initialNodes} funnelName={funnelName} />
}
