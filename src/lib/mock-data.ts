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

export type MockNodeType = "trigger" | "action" | "condition" | "integration" | "goal"

export interface MockBuilderNode {
  id: string
  type: MockNodeType
  x: number
  y: number
  title: string
  subtitle: string
  outputs: string[]
}

export const MOCK_FUNNELS = [
  {
    id: "freebie-funnel",
    name: "Freebie Funnel",
    type: "freebie" as const,
    status: "active" as const,
    contacts: 1247,
    conversions: 58,
    conversionRate: 4.65,
    revenue: 23200,
    lastModified: "2024-09-01",
    steps: 5,
  },
  {
    id: "call-funnel",
    name: "High-Ticket Call Funnel",
    type: "call" as const,
    status: "active" as const,
    contacts: 924,
    conversions: 61,
    conversionRate: 6.6,
    revenue: 72700,
    lastModified: "2024-09-04",
    steps: 7,
  },
]

export const MOCK_FUNNEL_NODES: Record<string, MockBuilderNode[]> = {
  "freebie-funnel": [
    { id: "n1", type: "trigger",     x: 80,   y: 200, title: "Instagram Comment",  subtitle: 'Keyword "free" triggers DM flow',   outputs: ["n2"] },
    { id: "n2", type: "action",      x: 400,  y: 200, title: "Send Welcome DM",    subtitle: "Greeting + freebie CTA button",      outputs: ["n3"] },
    { id: "n3", type: "action",      x: 720,  y: 200, title: "Share Freebie Link", subtitle: "PDF guide or mini-course access",    outputs: ["n4"] },
    { id: "n4", type: "integration", x: 1040, y: 200, title: "Add to Kit Sequence",subtitle: "7-day email nurture starts",         outputs: ["n5"] },
    { id: "n5", type: "goal",        x: 1360, y: 200, title: "Purchase Made",      subtitle: "Stripe payment confirmed",            outputs: []     },
  ],
  "call-funnel": [
    { id: "n1", type: "trigger",     x: 80,   y: 220, title: "Instagram Comment",   subtitle: 'Keyword "call" triggers DM flow',   outputs: ["n2"]        },
    { id: "n2", type: "action",      x: 400,  y: 220, title: "Send Welcome DM",     subtitle: "Personal video welcome message",    outputs: ["n3"]        },
    { id: "n3", type: "action",      x: 720,  y: 220, title: "Share VSL Video",     subtitle: "Value-stack video + CTA button",    outputs: ["n4"]        },
    { id: "n4", type: "integration", x: 1040, y: 220, title: "Book Discovery Call", subtitle: "Calendly scheduling link sent",     outputs: ["n5", "n6"] },
    { id: "n5", type: "condition",   x: 1360, y: 100, title: "Call Completed?",     subtitle: "If yes → pitch the offer",          outputs: ["n7"]        },
    { id: "n6", type: "action",      x: 1360, y: 340, title: "Follow-up Sequence",  subtitle: "No-show re-engagement DMs",         outputs: []            },
    { id: "n7", type: "goal",        x: 1680, y: 100, title: "Payment Collected",   subtitle: "High-ticket close via Stripe",      outputs: []            },
  ],
  new: [
    { id: "n1", type: "trigger", x: 100, y: 200, title: "Choose a Trigger", subtitle: "Click + to add your first step", outputs: [] },
  ],
}

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
