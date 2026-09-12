import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const UpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nodes: z.array(z.record(z.unknown())).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
})

async function getOwnedFunnel(id: string, userId: string) {
  return prisma.funnel.findFirst({ where: { id, userId } })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const funnel = await getOwnedFunnel(id, session.user.id)
  if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(funnel)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const existing = await getOwnedFunnel(id, session.user.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const funnel = await prisma.funnel.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.nodes !== undefined && { nodes: parsed.data.nodes as object[] }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
    },
  })

  return NextResponse.json(funnel)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const existing = await getOwnedFunnel(id, session.user.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.funnel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
