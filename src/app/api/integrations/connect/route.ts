import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encrypt"

const Schema = z.object({
  provider: z.enum(["STRIPE", "KIT", "MANYCHAT"]),
  apiKey: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  const { provider, apiKey } = parsed.data
  const encryptedKey = await encrypt(apiKey)

  await prisma.connectedAccount.upsert({
    where: { userId_provider: { userId: session.user.id, provider } },
    create: { userId: session.user.id, provider, apiKey: encryptedKey, status: "ACTIVE" },
    update: { apiKey: encryptedKey, status: "ACTIVE" },
  })

  return NextResponse.json({ success: true })
}
