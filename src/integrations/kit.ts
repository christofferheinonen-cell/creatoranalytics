// Kit (ConvertKit) integration — syncs email subscribers to FunnelEvents
// API docs: https://developers.kit.com/docs
// Auth: Bearer token (API key)

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
  subscribers: KitSubscriber[]
  pagination: {
    has_next_page: boolean
    end_cursor: string | null
  }
}

async function fetchSubscribers(
  apiKey: string,
  sinceTimestamp?: Date,
  afterCursor?: string
): Promise<KitListResponse> {
  const params = new URLSearchParams({ per_page: "1000" })
  if (sinceTimestamp) {
    params.set("created_after", sinceTimestamp.toISOString())
  }
  if (afterCursor) {
    params.set("after", afterCursor)
  }

  const res = await fetch(`https://api.kit.com/v4/subscribers?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Kit-Api-Key": apiKey,
    },
  })

  if (!res.ok) {
    const err = (await res.json()) as { message?: string }
    throw new Error(err.message ?? `Kit API error ${res.status}`)
  }

  return res.json() as Promise<KitListResponse>
}

export async function syncKit(
  connectedAccountId: string,
  apiKey: string,
  userId: string,
  sinceTimestamp?: Date
): Promise<SyncResult> {
  let eventsIngested = 0
  const errors: string[] = []
  let afterCursor: string | undefined
  let hasMore = true

  while (hasMore) {
    const page = await fetchSubscribers(apiKey, sinceTimestamp, afterCursor)

    for (const subscriber of page.subscribers) {
      try {
        const email = subscriber.email_address
        if (!email) continue

        const eventType = subscriber.state === "active" ? "SUBSCRIBED" : "UNSUBSCRIBED"
        const timestamp = new Date(subscriber.created_at)

        // Find or create contact
        let contact = await prisma.contact.findFirst({ where: { userId, email } })
        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              userId,
              email,
              name: subscriber.first_name ?? undefined,
              kitSubscriberId: String(subscriber.id),
              currentStage: eventType === "SUBSCRIBED" ? "SUBSCRIBED" : undefined,
            },
          })
        } else if (!contact.kitSubscriberId) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              kitSubscriberId: String(subscriber.id),
              currentStage: eventType === "SUBSCRIBED" ? "SUBSCRIBED" : contact.currentStage,
            },
          })
        }

        // Idempotent: check for existing event with this kit_subscriber_id
        const existing = await prisma.funnelEvent.findFirst({
          where: {
            contactId: contact.id,
            type: eventType,
            metadata: { path: ["kit_subscriber_id"], equals: subscriber.id },
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
        errors.push(`Subscriber ${subscriber.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    hasMore = page.pagination.has_next_page
    afterCursor = page.pagination.end_cursor ?? undefined
  }

  return { success: errors.length === 0, eventsIngested, errors }
}
