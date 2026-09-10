// Kit (ConvertKit) integration — syncs email subscribers to FunnelEvents
// Real API docs: https://developers.kit.com/docs
// Auth: API key (no OAuth) — creator pastes their API key in the UI

import type { SyncResult } from "@/types"

// ─── API response shapes ──────────────────────────────────────────────────────

interface KitSubscriber {
  id: number
  first_name: string | null
  email_address: string
  state: "active" | "inactive" | "cancelled" | "bounced" | "complained"
  created_at: string // ISO 8601
  fields: Record<string, string | null>
}

interface KitListSubscribersResponse {
  total_subscribers: number
  page: number
  total_pages: number
  subscribers: KitSubscriber[]
}

// ─── API key validation ───────────────────────────────────────────────────────

export async function validateKitApiKey(apiKey: string): Promise<boolean> {
  // TODO: Real call to https://api.kit.com/v4/account?api_key={key}
  // Returns 200 with account info if valid, 401 if not.

  // Mock: any non-empty key is "valid" in dev
  return apiKey.length > 10
}

// ─── Sync function ────────────────────────────────────────────────────────────

export async function syncKit(
  connectedAccountId: string,
  apiKey: string,
  userId: string,
  sinceTimestamp?: Date
): Promise<SyncResult> {
  // TODO: Replace with real Kit API calls once credentials are available.
  //
  // Real implementation pattern:
  //   const baseUrl = "https://api.kit.com/v4"
  //   page through GET /subscribers?api_key={key}&from={sinceISO}
  //   For each subscriber with state "active":
  //     upsert Contact by email, write FunnelEvent(SUBSCRIBED)
  //   For state "cancelled":
  //     write FunnelEvent(UNSUBSCRIBED)

  const mockSubscribers: KitSubscriber[] = [
    {
      id: 10001,
      first_name: "Sarah",
      email_address: "sarah.chen@gmail.com",
      state: "active",
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      fields: {},
    },
  ]

  void mockSubscribers

  return {
    success: true,
    eventsIngested: 0,
    errors: [],
  }
}
