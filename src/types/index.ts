// Shared TypeScript types for the application

export type Provider = "STRIPE" | "KIT" | "MANYCHAT" | "CALENDLY"
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

export type EventSource = "MANYCHAT" | "KIT" | "STRIPE" | "CALENDLY"

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
