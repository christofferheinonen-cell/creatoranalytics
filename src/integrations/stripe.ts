// Stripe integration — syncs customers and charges to FunnelEvents
// Real API docs: https://stripe.com/docs/api
// Auth: OAuth via Stripe Connect (creator connects their own Stripe account)

import type { SyncResult } from "@/types"

// ─── API response shapes (matching actual Stripe objects) ─────────────────────

interface StripeCustomer {
  id: string
  email: string | null
  name: string | null
  created: number // Unix timestamp
  metadata: Record<string, string>
}

interface StripeCharge {
  id: string
  customer: string | null
  amount: number // in cents
  currency: string
  created: number
  status: "succeeded" | "pending" | "failed"
  refunded: boolean
  receipt_email: string | null
  metadata: Record<string, string>
}

interface StripeListResponse<T> {
  object: "list"
  data: T[]
  has_more: boolean
  url: string
}

// ─── Sync function ────────────────────────────────────────────────────────────

export async function syncStripe(
  connectedAccountId: string,
  accessToken: string,
  userId: string,
  sinceTimestamp?: Date
): Promise<SyncResult> {
  // TODO: Replace mock data with real Stripe API calls once credentials are available.
  // Real implementation pattern:
  //
  //   const charges = await fetchAllPages<StripeCharge>(
  //     accessToken,
  //     "https://api.stripe.com/v1/charges",
  //     { created: { gte: sinceUnix }, limit: 100 }
  //   )
  //
  // For each charge: upsert Contact by email, write FunnelEvent(PURCHASED or REFUNDED).
  // For refunds: charge.refunded === true → write FunnelEvent(REFUNDED).
  //
  // KNOWN SOFT SPOT (call funnel): A Stripe customer who paid during/after a call
  // is joined back to a Contact via email only — there is no checkout-session metadata
  // linking them to the Calendly invitee. This is a best-effort match in v1.

  const mockCharges: StripeCharge[] = [
    {
      id: "ch_mock_001",
      customer: "cus_mock_001",
      amount: 240000,
      currency: "usd",
      created: Date.now() / 1000 - 86400,
      status: "succeeded",
      refunded: false,
      receipt_email: "sarah.chen@gmail.com",
      metadata: {},
    },
  ]

  void mockCharges // will be used in real implementation

  return {
    success: true,
    eventsIngested: 0,
    errors: [],
  }
}

// ─── OAuth helpers ────────────────────────────────────────────────────────────

export function getStripeConnectUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.STRIPE_CLIENT_ID ?? "",
    scope: "read_only",
    state,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/stripe/callback`,
  })
  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`
}

export async function exchangeStripeCode(code: string): Promise<{
  accessToken: string
  refreshToken: string | null
  stripeUserId: string
}> {
  // TODO: Real exchange against https://connect.stripe.com/oauth/token
  throw new Error("Stripe OAuth exchange not yet implemented — add real credentials first")
}
