// Shared TypeScript types for the application

export type Provider = "STRIPE" | "KIT" | "MANYCHAT" | "CALENDLY" | "GOOGLE_ANALYTICS"
export type AccountStatus = "ACTIVE" | "DISCONNECTED" | "ERROR"
export type SyncStatus = "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL"

export type FunnelEventType =
  | "COMMENT"
  | "DM_STARTED"
  | "FREEBIE_CLAIMED"
  | "LINK_CLICKED"
  | "CALL_SCHEDULED"
  | "CALL_COMPLETED"
  | "CALL_NO_SHOW"
  | "SUBSCRIBED"
  | "PURCHASED"
  | "UNSUBSCRIBED"
  | "REFUNDED"
  | "WEBSITE_VISIT"
  | "PAGE_VIEW"

export type EventSource = "MANYCHAT" | "KIT" | "STRIPE" | "CALENDLY" | "GOOGLE_ANALYTICS"

export interface GA4TrafficSource {
  source: string
  sessions: number
  pct: number
}

export interface GA4TopPage {
  path: string
  views: number
  sessions: number
}

export interface GA4Summary {
  sessions: number
  previousSessions: number
  users: number
  previousUsers: number
  pageViews: number
  engagementRate: number
  sources: GA4TrafficSource[]
  topPages: GA4TopPage[]
  weeklyData: { week: string; sessions: number }[]
}

export interface FunnelStage {
  stage: string
  label: string
  count: number
  source: string
}

export interface FunnelDefinition {
  id: string
  name: string
  description?: string
  stages: FunnelEventType[]
  isDefault: boolean
}

export interface ConnectedAccountSummary {
  provider: Provider
  label: string
  status: AccountStatus | "disconnected"
  lastSyncedAt: string | null
}

export interface ContactRow {
  id: string
  name: string | null
  email: string | null
  currentStage: FunnelEventType | null
  sources: string[]
  lifetimeValue: number
  joinedAt: string
  funnelType?: string
}

export interface SyncResult {
  success: boolean
  eventsIngested: number
  errors: string[]
}
