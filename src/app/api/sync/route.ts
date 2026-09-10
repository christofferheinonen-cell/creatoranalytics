import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { runSyncForAccount, runSyncForUser } from "@/integrations/sync"

const SyncSchema = z.object({
  // Sync a single connected account, or all accounts for the user
  connectedAccountId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
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
      // Verify the account belongs to this user before syncing
      const account = await prisma.connectedAccount.findFirst({
        where: { id: connectedAccountId, userId: session.user.id },
      })
      if (!account) {
        return NextResponse.json({ error: "Connected account not found" }, { status: 404 })
      }

      const result = await runSyncForAccount(connectedAccountId)
      return NextResponse.json(result)
    }

    // Sync all accounts for this user
    const result = await runSyncForUser(session.user.id)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[sync]", err)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
