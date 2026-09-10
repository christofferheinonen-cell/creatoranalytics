import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const Schema = z.object({
  provider: z.enum(["STRIPE", "KIT", "MANYCHAT", "CALENDLY"]),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  await prisma.connectedAccount.deleteMany({
    where: { userId: session.user.id, provider: parsed.data.provider },
  })

  return NextResponse.json({ success: true })
}
