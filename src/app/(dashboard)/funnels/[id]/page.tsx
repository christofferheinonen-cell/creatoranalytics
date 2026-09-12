import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FunnelBuilder } from "@/components/funnels/FunnelBuilder"
import type { MockBuilderNode } from "@/lib/mock-data"

const BLANK_CANVAS: MockBuilderNode[] = [
  { id: "n1", type: "trigger", x: 100, y: 200, title: "Choose a Trigger", subtitle: "Click + to add your first step", outputs: [] },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  if (id === "new") return { title: "New Funnel — Builder" }

  const session = await auth()
  if (!session?.user) return { title: "Builder" }

  const funnel = await prisma.funnel.findFirst({ where: { id, userId: session.user.id }, select: { name: true } })
  return { title: funnel ? `${funnel.name} — Builder` : "Funnel Builder" }
}

export default async function FunnelBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id === "new") {
    return (
      <FunnelBuilder
        initialNodes={BLANK_CANVAS}
        funnelName="Untitled Funnel"
        funnelId={null}
      />
    )
  }

  const session = await auth()
  if (!session?.user) notFound()

  const funnel = await prisma.funnel.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!funnel) notFound()

  const nodes = Array.isArray(funnel.nodes) ? (funnel.nodes as unknown as MockBuilderNode[]) : BLANK_CANVAS

  return (
    <FunnelBuilder
      initialNodes={nodes}
      funnelName={funnel.name}
      funnelId={funnel.id}
    />
  )
}
