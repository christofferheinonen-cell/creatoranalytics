import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// Deletes all FunnelEvents and Contacts for the authenticated user.
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const [deletedEvents, deletedContacts] = await prisma.$transaction([
    prisma.funnelEvent.deleteMany({ where: { userId } }),
    prisma.contact.deleteMany({ where: { userId } }),
  ])

  // Reset lastSyncedAt so the next sync does a full historical re-fetch,
  // not an incremental one anchored to the now-stale timestamp.
  await prisma.connectedAccount.updateMany({
    where: { userId },
    data: { lastSyncedAt: null },
  })

  return NextResponse.json({
    ok: true,
    deletedEvents: deletedEvents.count,
    deletedContacts: deletedContacts.count,
  })
}
