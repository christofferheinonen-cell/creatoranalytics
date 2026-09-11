// Kit (ConvertKit) integration — syncs email subscribers to FunnelEvents
// Uses ConvertKit v3 API (api.convertkit.com/v3) — accepts the API Secret from
// Kit Settings → Advanced → API
// Docs: https://developers.convertkit.com/#list-subscribers

import { prisma } from "@/lib/prisma"
import type { SyncResult } from "@/types"

interface KitSubscriber {
  id: number
  first_name: string | null
  email_address: string
  state: "active" | "inactive" | "cancelled" | "bounced" | "complained"
  created_at: string // ISO 8601
}

interface KitListResponse {
  total_subscribers: number
  page: number
  total_pages: number
  subscribers: KitSubscriber[]
}

async function fetchSubscribersPage(
  apiSecret: string,
  page: number,
  sinceTimestamp?: Date
): Promise<KitListResponse> {
  const params = new URLSearchParams({
    api_secret: apiSecret,
    page: String(page),
    per_page: "1000",
    sort_order: "asc",
  })
  if (sinceTimestamp) {
    params.set("from", sinceTimestamp.toISOString().split("T")[0]) // YYYY-MM-DD
  }

  const res = await fetch(
    `https://api.convertkit.com/v3/subscribers?${params}`
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Kit API error ${res.status}: ${body}`)
  }

  return res.json() as Promise<KitListResponse>
}

export async function syncKit(
  connectedAccountId: string,
  apiSecret: string,
  userId: string,
  sinceTimestamp?: Date
): Promise<SyncResult> {
  let eventsIngested = 0
  const errors: string[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const data = await fetchSubscribersPage(apiSecret, page, sinceTimestamp)
    totalPages = data.total_pages

    for (const subscriber of data.subscribers) {
      try {
        const email = subscriber.email_address
        if (!email) continue

        const eventType =
          subscriber.state === "active" ? "SUBSCRIBED" : "UNSUBSCRIBED"
        const timestamp = new Date(subscriber.created_at)

        // Find or create contact
        let contact = await prisma.contact.findFirst({
          where: { userId, email },
        })
        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              userId,
              email,
              name: subscriber.first_name ?? undefined,
              kitSubscriberId: String(subscriber.id),
              currentStage:
                eventType === "SUBSCRIBED" ? "SUBSCRIBED" : undefined,
            },
          })
        } else {
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              ...(contact.kitSubscriberId ? {} : { kitSubscriberId: String(subscriber.id) }),
              currentStage:
                eventType === "SUBSCRIBED" ? "SUBSCRIBED" : contact.currentStage,
            },
          })
        }

        // Idempotent: skip if this event already exists
        const existing = await prisma.funnelEvent.findFirst({
          where: {
            contactId: contact.id,
            type: eventType,
            metadata: {
              path: ["kit_subscriber_id"],
              equals: subscriber.id,
            },
          },
        })

        if (!existing) {
          await prisma.funnelEvent.create({
            data: {
              contactId: contact.id,
              userId,
              type: eventType,
              source: "KIT",
              timestamp,
              metadata: {
                kit_subscriber_id: subscriber.id,
                state: subscriber.state,
              },
            },
          })
          eventsIngested++
        }
      } catch (err) {
        errors.push(
          `Subscriber ${subscriber.id}: ${err instanceof Error ? err.message : String(err)}`
        )
      }
    }

    page++
  }

  return { success: errors.length === 0, eventsIngested, errors }
}
