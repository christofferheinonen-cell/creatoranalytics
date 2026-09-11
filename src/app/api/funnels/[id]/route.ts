import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id
  const { id } = await params

  const existing = await prisma.funnelDefinition.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const { name, description, stages } = body as {
    name: string
    description?: string
    stages: string[]
  }

  if (!name?.trim() || !Array.isArray(stages) || stages.length < 2) {
    return NextResponse.json(
      { error: "Name and at least 2 stages are required" },
      { status: 400 }
    )
  }

  const updated = await prisma.funnelDefinition.update({
    where: { id },
    data: { name: name.trim(), description, stages },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id
  const { id } = await params

  const existing = await prisma.funnelDefinition.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.funnelDefinition.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
