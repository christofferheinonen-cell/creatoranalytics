import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const funnels = await prisma.funnelDefinition.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })

  return NextResponse.json(funnels)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

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

  const funnel = await prisma.funnelDefinition.create({
    data: { userId, name: name.trim(), description, stages, isDefault: false },
  })

  return NextResponse.json(funnel, { status: 201 })
}
