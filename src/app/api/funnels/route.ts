import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const CreateSchema = z.object({
  name: z.string().min(1).max(200).default("Untitled Funnel"),
  nodes: z.array(z.record(z.unknown())).default([]),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const funnels = await prisma.funnel.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, status: true, nodes: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(funnels)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const funnel = await prisma.funnel.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      nodes: parsed.data.nodes as object[],
    },
  })

  return NextResponse.json(funnel, { status: 201 })
}
