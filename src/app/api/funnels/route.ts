import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  stages: z.array(z.string()).min(1).max(10),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const funnels = await prisma.funnelDefinition.findMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }] },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })

  return NextResponse.json(funnels)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const funnel = await prisma.funnelDefinition.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      stages: parsed.data.stages,
      isDefault: false,
    },
  })

  return NextResponse.json(funnel, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const funnel = await prisma.funnelDefinition.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.funnelDefinition.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
