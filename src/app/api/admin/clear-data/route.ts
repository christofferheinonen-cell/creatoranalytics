import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// Deletes all FunnelEvents and Contacts for every user.
// Protected by CRON_SECRET — call once to wipe seeded/fake data.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [deletedEvents, deletedContacts] = await prisma.$transaction([
    prisma.funnelEvent.deleteMany({}),
    prisma.contact.deleteMany({}),
  ])

  return NextResponse.json({
    ok: true,
    deletedEvents: deletedEvents.count,
    deletedContacts: deletedContacts.count,
  })
}
