import type { FunnelEventType, EventSource } from "@/types"

export interface EventMeta {
  label: string
  source: EventSource
  description: string
}

export const EVENT_CONFIG: Record<FunnelEventType, EventMeta> = {
  COMMENT: { label: "Social Comment", source: "MANYCHAT", description: "User comments on a post or reel" },
  DM_STARTED: { label: "DM Started", source: "MANYCHAT", description: "User initiates a DM conversation" },
  FREEBIE_CLAIMED: { label: "Freebie Claimed", source: "MANYCHAT", description: "User claims a lead magnet" },
  LINK_CLICKED: { label: "Link Clicked", source: "MANYCHAT", description: "User clicks a link sent via DM" },
  CALL_SCHEDULED: { label: "Call Scheduled", source: "CALENDLY", description: "User books a discovery call" },
  CALL_COMPLETED: { label: "Call Completed", source: "CALENDLY", description: "Call session was completed" },
  CALL_NO_SHOW: { label: "Call No-Show", source: "CALENDLY", description: "User missed the call" },
  SUBSCRIBED: { label: "Email Subscribed", source: "KIT", description: "User subscribes to email list" },
  UNSUBSCRIBED: { label: "Unsubscribed", source: "KIT", description: "User unsubscribes from email list" },
  PURCHASED: { label: "Purchased", source: "STRIPE", description: "User completes a purchase" },
  REFUNDED: { label: "Refunded", source: "STRIPE", description: "Purchase was refunded" },
}

export const SOURCE_META: Record<EventSource, {
  label: string
  dot: string
  badge: string
}> = {
  MANYCHAT: {
    label: "ManyChat",
    dot: "bg-orange-400",
    badge: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  CALENDLY: {
    label: "Calendly",
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 border border-violet-200",
  },
  KIT: {
    label: "Kit",
    dot: "bg-teal-500",
    badge: "bg-teal-50 text-teal-700 border border-teal-200",
  },
  STRIPE: {
    label: "Stripe",
    dot: "bg-brand-indigo-500",
    badge: "bg-brand-indigo-50 text-brand-indigo-700 border border-brand-indigo-200",
  },
}

export const EVENTS_BY_SOURCE: Record<EventSource, FunnelEventType[]> = {
  MANYCHAT: ["COMMENT", "DM_STARTED", "FREEBIE_CLAIMED", "LINK_CLICKED"],
  CALENDLY: ["CALL_SCHEDULED", "CALL_COMPLETED", "CALL_NO_SHOW"],
  KIT: ["SUBSCRIBED", "UNSUBSCRIBED"],
  STRIPE: ["PURCHASED", "REFUNDED"],
}
