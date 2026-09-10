// Calendly integration — syncs scheduled/completed/no-show events to FunnelEvents
// Real API docs: https://developer.calendly.com/api-docs
// Auth: OAuth 2.0 — creator connects via Calendly OAuth flow

import type { SyncResult } from "@/types"

// ─── API response shapes ──────────────────────────────────────────────────────

interface CalendlyPaginatedResponse<T> {
  collection: T[]
  pagination: {
    count: number
    next_page: string | null
    next_page_token: string | null
    previous_page: string | null
    previous_page_token: string | null
  }
}

interface CalendlyEvent {
  uri: string
  name: string
  status: "active" | "canceled"
  start_time: string  // ISO 8601
  end_time: string
  event_type: string  // event type URI
  location: { type: string } | null
  cancellation: { canceler_type: string; reason: string | null } | null
  created_at: string
  updated_at: string
}

interface CalendlyInvitee {
  uri: string
  email: string
  name: string
  status: "active" | "canceled"
  timezone: string
  created_at: string
  updated_at: string
  event: string // event URI
  no_show: { uri: string } | null
  questions_and_answers: { question: string; answer: string }[]
}

// ─── OAuth helpers ────────────────────────────────────────────────────────────

export function getCalendlyOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.CALENDLY_CLIENT_ID ?? "",
    response_type: "code",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/calendly/callback`,
    state,
  })
  return `https://auth.calendly.com/oauth/authorize?${params.toString()}`
}

export async function exchangeCalendlyCode(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: Date
}> {
  // TODO: Real exchange against https://auth.calendly.com/oauth/token
  throw new Error("Calendly OAuth exchange not yet implemented — add real credentials first")
}

// ─── Sync function ────────────────────────────────────────────────────────────

export async function syncCalendly(
  connectedAccountId: string,
  accessToken: string,
  userId: string,
  sinceTimestamp?: Date
): Promise<SyncResult> {
  // TODO: Replace with real Calendly API calls once credentials are available.
  //
  // Real implementation pattern:
  //   1. GET https://api.calendly.com/users/me → fetch user URI
  //   2. GET https://api.calendly.com/scheduled_events?user={uri}&min_start_time={since}
  //   3. For each event, GET https://api.calendly.com/scheduled_events/{uuid}/invitees
  //   4. Map each invitee:
  //      - status: "active" → FunnelEvent(CALL_SCHEDULED)
  //      - status: "canceled" → FunnelEvent(CALL_NO_SHOW) if no_show is set, else skip
  //      - event.status: "canceled" → FunnelEvent(CALL_NO_SHOW)
  //      - event end_time has passed and status: "active" → FunnelEvent(CALL_COMPLETED)
  //
  //   Join key: invitee.email → Contact.email → match back to Stripe customer

  const mockEvents: CalendlyEvent[] = [
    {
      uri: "https://api.calendly.com/scheduled_events/mock-001",
      name: "Strategy Call",
      status: "active",
      start_time: new Date(Date.now() - 86400000).toISOString(),
      end_time: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      event_type: "https://api.calendly.com/event_types/mock-type",
      location: { type: "zoom" },
      cancellation: null,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  void mockEvents

  return {
    success: true,
    eventsIngested: 0,
    errors: [],
  }
}
