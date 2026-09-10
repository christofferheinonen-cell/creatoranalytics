// Mock data for the dashboard — used when no integrations are connected yet.
// Replace calls to these with real DB queries as integrations are wired up.

export const MOCK_FREEBIE_FUNNEL = [
  { stage: "COMMENT", label: "Social Comment", count: 1247, source: "manychat" },
  { stage: "DM_STARTED", label: "DM Started", count: 812, source: "manychat" },
  { stage: "FREEBIE_CLAIMED", label: "Freebie Claimed", count: 501, source: "manychat" },
  { stage: "SUBSCRIBED", label: "Email Subscribed", count: 389, source: "kit" },
  { stage: "PURCHASED", label: "Purchased", count: 58, source: "stripe" },
]

export const MOCK_CALL_FUNNEL = [
  { stage: "COMMENT", label: "Social Comment", count: 924, source: "manychat" },
  { stage: "DM_STARTED", label: "DM Started", count: 601, source: "manychat" },
  { stage: "LINK_CLICKED", label: "Video Viewed", count: 437, source: "manychat" },
  { stage: "CALL_SCHEDULED", label: "Call Booked", count: 109, source: "calendly" },
  { stage: "CALL_COMPLETED", label: "Call Completed", count: 82, source: "calendly" },
  { stage: "PURCHASED", label: "Purchased", count: 61, source: "stripe" },
]

// Combined "all funnels" view — top-of-funnel to revenue aggregate
export const MOCK_COMBINED_FUNNEL = [
  { stage: "COMMENT", label: "Social Comment", count: 2171, source: "manychat" },
  { stage: "DM_STARTED", label: "DM Started", count: 1413, source: "manychat" },
  { stage: "EMAIL_OR_LINK", label: "Engaged (Email/Video)", count: 938, source: "kit/manychat" },
  { stage: "CONVERTED_MID", label: "Deep Engaged (Claim/Call)", count: 692, source: "mixed" },
  { stage: "PURCHASED", label: "Purchased", count: 119, source: "stripe" },
]

// Revenue by week (last 12 weeks)
export const MOCK_REVENUE_DATA = [
  { week: "Jun W1", revenue: 4200 },
  { week: "Jun W2", revenue: 5800 },
  { week: "Jun W3", revenue: 3900 },
  { week: "Jun W4", revenue: 7200 },
  { week: "Jul W1", revenue: 6100 },
  { week: "Jul W2", revenue: 8400 },
  { week: "Jul W3", revenue: 7700 },
  { week: "Jul W4", revenue: 9200 },
  { week: "Aug W1", revenue: 8800 },
  { week: "Aug W2", revenue: 11300 },
  { week: "Aug W3", revenue: 10200 },
  { week: "Aug W4", revenue: 12800 },
]

export const MOCK_STATS = {
  totalRevenue: 95900,
  previousRevenue: 71200,
  totalContacts: 3184,
  previousContacts: 2640,
  activeSubscribers: 1247,
  callsBooked: 109,
  conversionRate: 5.48, // top-to-bottom across both funnels
}

export const MOCK_CONTACTS = [
  {
    id: "c1",
    name: "Sarah Chen",
    email: "sarah.chen@gmail.com",
    currentStage: "PURCHASED",
    sources: ["manychat", "kit", "stripe"],
    lifetimeValue: 2400,
    joinedAt: "2024-07-12",
    funnelType: "freebie",
  },
  {
    id: "c2",
    name: "Marcus Johnson",
    email: "marcus.j@outlook.com",
    currentStage: "SUBSCRIBED",
    sources: ["manychat", "kit"],
    lifetimeValue: 0,
    joinedAt: "2024-08-03",
    funnelType: "freebie",
  },
  {
    id: "c3",
    name: "Priya Patel",
    email: "priya@example.com",
    currentStage: "CALL_COMPLETED",
    sources: ["manychat", "calendly"],
    lifetimeValue: 0,
    joinedAt: "2024-08-18",
    funnelType: "call",
  },
  {
    id: "c4",
    name: "David Okafor",
    email: "d.okafor@gmail.com",
    currentStage: "PURCHASED",
    sources: ["manychat", "calendly", "stripe"],
    lifetimeValue: 4800,
    joinedAt: "2024-06-29",
    funnelType: "call",
  },
  {
    id: "c5",
    name: "Emma Larsson",
    email: "emma.l@gmail.com",
    currentStage: "FREEBIE_CLAIMED",
    sources: ["manychat"],
    lifetimeValue: 0,
    joinedAt: "2024-09-01",
    funnelType: "freebie",
  },
  {
    id: "c6",
    name: "James Rivera",
    email: "jrivera@outlook.com",
    currentStage: "CALL_SCHEDULED",
    sources: ["manychat", "calendly"],
    lifetimeValue: 0,
    joinedAt: "2024-09-04",
    funnelType: "call",
  },
  {
    id: "c7",
    name: "Amelia Thompson",
    email: "amelia.t@gmail.com",
    currentStage: "PURCHASED",
    sources: ["manychat", "kit", "stripe"],
    lifetimeValue: 1200,
    joinedAt: "2024-07-22",
    funnelType: "freebie",
  },
  {
    id: "c8",
    name: "Noah Kim",
    email: "noah.kim@icloud.com",
    currentStage: "DM_STARTED",
    sources: ["manychat"],
    lifetimeValue: 0,
    joinedAt: "2024-09-08",
    funnelType: "freebie",
  },
]

export const MOCK_INTEGRATIONS = [
  {
    provider: "STRIPE",
    label: "Stripe",
    status: "disconnected" as const,
    lastSyncedAt: null,
  },
  {
    provider: "KIT",
    label: "Kit (ConvertKit)",
    status: "disconnected" as const,
    lastSyncedAt: null,
  },
  {
    provider: "MANYCHAT",
    label: "ManyChat",
    status: "disconnected" as const,
    lastSyncedAt: null,
  },
  {
    provider: "CALENDLY",
    label: "Calendly",
    status: "disconnected" as const,
    lastSyncedAt: null,
  },
]
