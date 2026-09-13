// Google Analytics 4 Data API — syncs sessions and pageviews to FunnelEvents

import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encrypt"
import type { SyncResult } from "@/types"

interface GA4DimensionValue {
  value: string
}
interface GA4MetricValue {
  value: string
}
interface GA4Row {
  dimensionValues: GA4DimensionValue[]
  metricValues: GA4MetricValue[]
}
interface GA4ReportResponse {
  rows?: GA4Row[]
  error?: { message?: string }
}

async function fetchGA4Report(
  accessToken: string,
  propertyId: string,
  body: object
): Promise<GA4ReportResponse> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  )
  return res.json() as Promise<GA4ReportResponse>
}

async function getOrCreateGAContact(userId: string): Promise<string> {
  const existing = await prisma.contact.findFirst({
    where: { userId, email: null, name: "GA4 Sessions" },
    select: { id: true },
  })
  if (existing) return existing.id

  const contact = await prisma.contact.create({
    data: { userId, name: "GA4 Sessions" },
  })
  return contact.id
}

export async function syncGoogleAnalytics(
  connectedAccountId: string,
  encryptedAccessToken: string,
  userId: string,
  since?: Date
): Promise<SyncResult> {
  const errors: string[] = []
  let eventsIngested = 0

  const account = await prisma.connectedAccount.findUnique({
    where: { id: connectedAccountId },
    select: { accessToken: true, refreshToken: true, expiresAt: true },
  })

  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID
  if (!propertyId) {
    return { success: false, eventsIngested: 0, errors: ["No GA4 property ID configured. Set GOOGLE_ANALYTICS_PROPERTY_ID or reconnect with property selection."] }
  }

  let accessToken: string
  try {
    accessToken = await decrypt(encryptedAccessToken)
  } catch {
    return { success: false, eventsIngested: 0, errors: ["Failed to decrypt GA4 access token"] }
  }

  // Refresh token if expired
  if (account?.expiresAt && account.expiresAt < new Date() && account.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(account.refreshToken)
      if (refreshed.access_token) {
        const { encrypt } = await import("@/lib/encrypt")
        const newEncrypted = await encrypt(refreshed.access_token)
        await prisma.connectedAccount.update({
          where: { id: connectedAccountId },
          data: {
            accessToken: newEncrypted,
            expiresAt: new Date(Date.now() + (refreshed.expires_in ?? 3600) * 1000),
          },
        })
        accessToken = refreshed.access_token
      }
    } catch {
      errors.push("Token refresh failed; using existing token")
    }
  }

  const endDate = "today"
  const startDate = since
    ? since.toISOString().slice(0, 10)
    : "30daysAgo"

  // Fetch session-level data grouped by date and page path
  const sessionReport = await fetchGA4Report(accessToken, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }, { name: "pagePath" }],
    metrics: [{ name: "sessions" }, { name: "screenPageViews" }],
    limit: 10000,
  })

  if (sessionReport.error) {
    return { success: false, eventsIngested: 0, errors: [sessionReport.error.message ?? "GA4 API error"] }
  }

  const contactId = await getOrCreateGAContact(userId)

  for (const row of sessionReport.rows ?? []) {
    const dateStr = row.dimensionValues[0]?.value ?? ""
    const pagePath = row.dimensionValues[1]?.value ?? "/"
    const sessionCount = parseInt(row.metricValues[0]?.value ?? "0", 10)
    const pageViewCount = parseInt(row.metricValues[1]?.value ?? "0", 10)

    if (!dateStr || (sessionCount === 0 && pageViewCount === 0)) continue

    // Parse YYYYMMDD
    const year = parseInt(dateStr.slice(0, 4), 10)
    const month = parseInt(dateStr.slice(4, 6), 10) - 1
    const day = parseInt(dateStr.slice(6, 8), 10)
    const timestamp = new Date(year, month, day, 12, 0, 0)

    type EventInput = {
      contactId: string
      userId: string
      type: "WEBSITE_VISIT" | "PAGE_VIEW"
      source: "GOOGLE_ANALYTICS"
      timestamp: Date
      contentRef: string
      metadata: object
    }
    const rows: EventInput[] = []

    for (let i = 0; i < sessionCount; i++) {
      rows.push({
        contactId,
        userId,
        type: "WEBSITE_VISIT",
        source: "GOOGLE_ANALYTICS",
        timestamp,
        contentRef: pagePath,
        metadata: { sessions: sessionCount, pageViews: pageViewCount, date: dateStr },
      })
    }

    for (let i = 0; i < pageViewCount; i++) {
      rows.push({
        contactId,
        userId,
        type: "PAGE_VIEW",
        source: "GOOGLE_ANALYTICS",
        timestamp,
        contentRef: pagePath,
        metadata: { date: dateStr },
      })
    }

    if (rows.length > 0) {
      try {
        const result = await prisma.funnelEvent.createMany({ data: rows, skipDuplicates: true })
        eventsIngested += result.count
      } catch (err) {
        errors.push(`Failed to insert events for ${dateStr}/${pagePath}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  return { success: errors.length === 0, eventsIngested, errors }
}

async function refreshAccessToken(encryptedRefresh: string): Promise<{
  access_token?: string
  expires_in?: number
}> {
  const refreshToken = await decrypt(encryptedRefresh)
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_ANALYTICS_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  })
  return res.json() as Promise<{ access_token?: string; expires_in?: number }>
}

// Live summary fetch — used by the dashboard without storing to DB
export async function fetchGA4LiveSummary(
  encryptedAccessToken: string,
  propertyId: string
): Promise<import("@/types").GA4Summary | null> {
  let accessToken: string
  try {
    accessToken = await decrypt(encryptedAccessToken)
  } catch {
    return null
  }

  try {
    const [overviewRes, sourceRes, pageRes, weeklyRes] = await Promise.all([
      // Overall metrics current + previous period
      fetchGA4Report(accessToken, propertyId, {
        dateRanges: [
          { startDate: "28daysAgo", endDate: "today" },
          { startDate: "56daysAgo", endDate: "29daysAgo" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "engagementRate" },
        ],
      }),
      // Traffic sources
      fetchGA4Report(accessToken, propertyId, {
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      // Top pages
      fetchGA4Report(accessToken, propertyId, {
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 5,
      }),
      // Weekly sessions
      fetchGA4Report(accessToken, propertyId, {
        dateRanges: [{ startDate: "83daysAgo", endDate: "today" }],
        dimensions: [{ name: "isoYearIsoWeek" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "isoYearIsoWeek" } }],
        limit: 12,
      }),
    ])

    if (overviewRes.error) return null

    const cur = overviewRes.rows?.[0]
    const prev = overviewRes.rows?.[1]

    const sessions = parseInt(cur?.metricValues[0]?.value ?? "0", 10)
    const previousSessions = parseInt(prev?.metricValues[0]?.value ?? "0", 10)
    const users = parseInt(cur?.metricValues[1]?.value ?? "0", 10)
    const previousUsers = parseInt(prev?.metricValues[1]?.value ?? "0", 10)
    const pageViews = parseInt(cur?.metricValues[2]?.value ?? "0", 10)
    const engagementRate = parseFloat(cur?.metricValues[3]?.value ?? "0") * 100

    const totalSourceSessions = (sourceRes.rows ?? []).reduce(
      (sum, r) => sum + parseInt(r.metricValues[0]?.value ?? "0", 10),
      0
    )

    const sources = (sourceRes.rows ?? []).map((r) => {
      const s = parseInt(r.metricValues[0]?.value ?? "0", 10)
      return {
        source: r.dimensionValues[0]?.value ?? "Unknown",
        sessions: s,
        pct: totalSourceSessions > 0 ? Math.round((s / totalSourceSessions) * 1000) / 10 : 0,
      }
    })

    const topPages = (pageRes.rows ?? []).map((r) => ({
      path: r.dimensionValues[0]?.value ?? "/",
      views: parseInt(r.metricValues[0]?.value ?? "0", 10),
      sessions: parseInt(r.metricValues[1]?.value ?? "0", 10),
    }))

    const weeklyData = (weeklyRes.rows ?? []).map((r, i) => ({
      week: `W${i + 1}`,
      sessions: parseInt(r.metricValues[0]?.value ?? "0", 10),
    }))

    return { sessions, previousSessions, users, previousUsers, pageViews, engagementRate, sources, topPages, weeklyData }
  } catch {
    return null
  }
}
