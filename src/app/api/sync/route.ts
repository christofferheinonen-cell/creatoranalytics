import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { runSyncForAccount, runSyncForUser } from "@/integrations/sync"

const SyncSchema = z.object({
  connectedAccountId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = SyncSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { connectedAccountId } = parsed.data

    if (connectedAccountId) {
      const account = await prisma.connectedAccount.findFirst({
        where: { id: connectedAccountId, userId: session.user.id },
      })
      if (!account) {
        return NextResponse.json({ error: "Connected account not found" }, { status: 404 })
      }
      const result = await runSyncForAccount(connectedAccountId)
      return NextResponse.json(result)
    }

    const result = await runSyncForUser(session.user.id)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[sync]", err)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
