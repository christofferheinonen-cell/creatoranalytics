// Sync orchestrator — called from /api/sync or a future cron job

import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encrypt"
import { syncStripe } from "./stripe"
import { syncKit } from "./kit"
import { syncManyChat } from "./manychat"
import { syncCalendly } from "./calendly"
import { syncGoogleAnalytics } from "./google-analytics"
import type { SyncResult } from "@/types"

export async function runSyncForAccount(
  connectedAccountId: string
): Promise<SyncResult> {
  const account = await prisma.connectedAccount.findUnique({
    where: { id: connectedAccountId },
  })

  if (!account) {
    return { success: false, eventsIngested: 0, errors: ["Account not found"] }
  }

  const log = await prisma.syncLog.create({
    data: { connectedAccountId, status: "RUNNING" },
  })

  let result: SyncResult = { success: false, eventsIngested: 0, errors: [] }

  try {
    const since = account.lastSyncedAt ?? undefined

    switch (account.provider) {
      case "STRIPE":
        if (!account.apiKey) throw new Error("No API key for Stripe")
        result = await syncStripe(account.id, await decrypt(account.apiKey), account.userId, since)
        break
      case "KIT":
        if (!account.apiKey) throw new Error("No API key for Kit")
        result = await syncKit(account.id, await decrypt(account.apiKey), account.userId, since)
        break
      case "MANYCHAT":
        if (!account.apiKey) throw new Error("No API key for ManyChat")
        result = await syncManyChat(account.id, await decrypt(account.apiKey), account.userId, since)
        break
      case "CALENDLY":
        if (!account.accessToken) throw new Error("No access token for Calendly")
        result = await syncCalendly(account.id, await decrypt(account.accessToken), account.userId, since)
        break
      case "GOOGLE_ANALYTICS":
        if (!account.accessToken) throw new Error("No access token for Google Analytics")
        result = await syncGoogleAnalytics(account.id, account.accessToken, account.userId, since)
        break
      default:
        throw new Error(`Unknown provider: ${account.provider as string}`)
    }

    await prisma.$transaction([
      prisma.syncLog.update({
        where: { id: log.id },
        data: {
          status: result.errors.length > 0 ? "PARTIAL" : "SUCCESS",
          completedAt: new Date(),
          eventsIngested: result.eventsIngested,
          errors: result.errors.length > 0 ? result.errors : undefined,
        },
      }),
      prisma.connectedAccount.update({
        where: { id: connectedAccountId },
        data: { lastSyncedAt: new Date(), status: "ACTIVE" },
      }),
    ])
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: "FAILED", completedAt: new Date(), errors: [message] },
    })
    await prisma.connectedAccount.update({
      where: { id: connectedAccountId },
      data: { status: "ERROR" },
    })
    return { success: false, eventsIngested: 0, errors: [message] }
  }

  return result
}

export async function runSyncForUser(userId: string): Promise<{
  results: { provider: string; result: SyncResult }[]
}> {
  const accounts = await prisma.connectedAccount.findMany({
    where: { userId, status: { in: ["ACTIVE", "ERROR"] } },
  })

  const results = await Promise.allSettled(
    accounts.map((account) => runSyncForAccount(account.id))
  )

  return {
    results: results.map((r, i) => ({
      provider: accounts[i].provider,
      result:
        r.status === "fulfilled"
          ? r.value
          : { success: false, eventsIngested: 0, errors: [r.reason as string] },
    })),
  }
}
