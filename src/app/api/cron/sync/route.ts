import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { runSyncForAccount } from "@/integrations/sync"

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes — Vercel Pro allows up to 300s for cron

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accounts = await prisma.connectedAccount.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, provider: true, userId: true },
  })

  const results = await Promise.allSettled(
    accounts.map((account) => runSyncForAccount(account.id))
  )

  const summary = results.map((r, i) => ({
    provider: accounts[i].provider,
    userId: accounts[i].userId,
    success: r.status === "fulfilled" ? r.value.success : false,
    eventsIngested: r.status === "fulfilled" ? r.value.eventsIngested : 0,
    error: r.status === "rejected" ? String(r.reason) : undefined,
  }))

  console.log("[cron/sync]", JSON.stringify(summary))

  return NextResponse.json({ synced: accounts.length, summary })
}
