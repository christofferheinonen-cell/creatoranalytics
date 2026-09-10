// ManyChat integration — syncs DM bot events to FunnelEvents
// Real API docs: https://api.manychat.com/swagger
// Auth: API token (no OAuth) — creator pastes their token from ManyChat settings

import type { SyncResult } from "@/types"

// ─── API response shapes ──────────────────────────────────────────────────────

interface ManyChatSubscriber {
  id: string
  name: string
  first_name: string
  last_name: string
  profile_pic: string | null
  status: "active" | "archived"
  whatsapp_phone: string | null
  email: string | null
  live_chat_url: string
  last_interaction: string // ISO 8601
  subscribed_at: string   // ISO 8601
  is_optin: boolean
  custom_fields: { id: number; name: string; value: string | null }[]
}

interface ManyChatListResponse {
  status: "success" | "error"
  data: ManyChatSubscriber[]
  total_count: number
  page: number
  next_cursor: string | null
}

// ─── API key validation ───────────────────────────────────────────────────────

export async function validateManyChatToken(token: string): Promise<boolean> {
  // TODO: Real call to https://api.manychat.com/fb/page/getInfo
  // Returns 200 with page info if valid.
  return token.length > 10
}

// ─── Sync function ────────────────────────────────────────────────────────────

export async function syncManyChat(
  connectedAccountId: string,
  apiToken: string,
  userId: string,
  sinceTimestamp?: Date
): Promise<SyncResult> {
  // TODO: Replace with real ManyChat API calls once credentials are available.
  //
  // Real implementation pattern:
  //   GET https://api.manychat.com/fb/subscriber/getList?status=active&limit=100
  //   Cursor-paginate using next_cursor from each response.
  //
  //   For each subscriber:
  //     - subscribed_at event → FunnelEvent(DM_STARTED)
  //     - Check custom_fields for "freebie_claimed" → FunnelEvent(FREEBIE_CLAIMED)
  //     - Check custom_fields for "video_link_clicked" → FunnelEvent(LINK_CLICKED)
  //     - Filter by last_interaction >= sinceTimestamp to avoid re-processing
  //
  //   NOTE: ManyChat doesn't expose raw "comment" events via API; COMMENT events
  //   are typically inferred from the DM flow trigger (comment-triggered bot).
  //   In v1 we map DM_STARTED as the first trackable ManyChat event.

  const mockSubscribers: ManyChatSubscriber[] = [
    {
      id: "mc_001",
      name: "Sarah Chen",
      first_name: "Sarah",
      last_name: "Chen",
      profile_pic: null,
      status: "active",
      whatsapp_phone: null,
      email: "sarah.chen@gmail.com",
      live_chat_url: "https://m.me/...",
      last_interaction: new Date().toISOString(),
      subscribed_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      is_optin: true,
      custom_fields: [{ id: 1, name: "freebie_claimed", value: "true" }],
    },
  ]

  void mockSubscribers

  return {
    success: true,
    eventsIngested: 0,
    errors: [],
  }
}
