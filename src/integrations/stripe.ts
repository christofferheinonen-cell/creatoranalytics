// Stripe integration — syncs customers and charges to FunnelEvents

import { prisma } from "@/lib/prisma"
import type { SyncResult } from "@/types"

interface StripeCharge {
  id: string
  customer: string | null
  amount: number // in cents
  currency: string
  created: number // Unix timestamp
  status: "succeeded" | "pending" | "failed"
  refunded: boolean
  receipt_email: string | null
}

interface StripeListResponse<T> {
  data: T[]
  has_more: boolean
}

async function fetchCharges(
  apiKey: string,
  sinceTimestamp?: Date,
  startingAfter?: string
): Promise<StripeListResponse<StripeCharge>> {
  const params = new URLSearchParams({ limit: "100" })
  if (sinceTimestamp) {
    params.set("created[gte]", Math.floor(sinceTimestamp.getTime() / 1000).toString())
  }
  if (startingAfter) {
    params.set("starting_after", startingAfter)
  }

  const res = await fetch(`https://api.stripe.com/v1/charges?${params}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `Stripe API error ${res.status}`)
  }

  return res.json() as Promise<StripeListResponse<StripeCharge>>
}

export async function syncStripe(
  connectedAccountId: string,
  apiKey: string,
  userId: string,
  sinceTimestamp?: Date
): Promise<SyncResult> {
  let eventsIngested = 0
  const errors: string[] = []
  let startingAfter: string | undefined
  let hasMore = true

  while (hasMore) {
    const page = await fetchCharges(apiKey, sinceTimestamp, startingAfter)

    for (const charge of page.data) {
      try {
        if (charge.status !== "succeeded") continue
        const email = charge.receipt_email
        if (!email) continue

        // Find or create contact
        let contact = await prisma.contact.findFirst({ where: { userId, email } })
        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              userId,
              email,
              stripeCustomerId: charge.customer ?? undefined,
              currentStage: "PURCHASED",
            },
          })
        } else {
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              ...(charge.customer && !contact.stripeCustomerId ? { stripeCustomerId: charge.customer } : {}),
              currentStage: "PURCHASED",
            },
          })
        }

        // Upsert PURCHASED event (idempotent by stripe_charge_id in metadata)
        const existingPurchase = await prisma.funnelEvent.findFirst({
          where: {
            contactId: contact.id,
            type: "PURCHASED",
            metadata: { path: ["stripe_charge_id"], equals: charge.id },
          },
        })

        if (!existingPurchase) {
          await prisma.funnelEvent.create({
            data: {
              contactId: contact.id,
              userId,
              type: "PURCHASED",
              source: "STRIPE",
              timestamp: new Date(charge.created * 1000),
              value: charge.amount / 100,
              metadata: { stripe_charge_id: charge.id, currency: charge.currency },
            },
          })
          eventsIngested++
        }

        // Write REFUNDED event if charge was refunded
        if (charge.refunded) {
          const existingRefund = await prisma.funnelEvent.findFirst({
            where: {
              contactId: contact.id,
              type: "REFUNDED",
              metadata: { path: ["stripe_charge_id"], equals: charge.id },
            },
          })

          if (!existingRefund) {
            await prisma.funnelEvent.create({
              data: {
                contactId: contact.id,
                userId,
                type: "REFUNDED",
                source: "STRIPE",
                timestamp: new Date(charge.created * 1000),
                value: charge.amount / 100,
                metadata: { stripe_charge_id: charge.id, currency: charge.currency },
              },
            })
            eventsIngested++
          }
        }
      } catch (err) {
        errors.push(`Charge ${charge.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    hasMore = page.has_more
    if (page.data.length > 0 && hasMore) {
      startingAfter = page.data[page.data.length - 1].id
    } else {
      hasMore = false
    }
  }

  return { success: errors.length === 0, eventsIngested, errors }
}
