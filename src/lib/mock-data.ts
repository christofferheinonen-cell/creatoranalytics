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

// Node types map to data sources so color-coding reflects which integration each stage tracks
export type MockNodeType = "manychat" | "kit" | "calendly" | "stripe" | "condition" | "goal"

export interface MockBuilderNode {
  id: string
  type: MockNodeType
  x: number
  y: number
  title: string
  subtitle: string
  outputs: string[]
  // Maps to FunnelEventType in the DB — null for visual-only nodes (goal markers, conditions)
  eventType?: string | null
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
    { id: "n1", type: "manychat", x: 80,   y: 200, title: "Instagram Comment", subtitle: "Tracked via ManyChat",         outputs: ["n2"], eventType: "COMMENT"         },
    { id: "n2", type: "manychat", x: 400,  y: 200, title: "DM Started",        subtitle: "Tracked via ManyChat",         outputs: ["n3"], eventType: "DM_STARTED"      },
    { id: "n3", type: "manychat", x: 720,  y: 200, title: "Freebie Claimed",   subtitle: "Link opened in DM",            outputs: ["n4"], eventType: "FREEBIE_CLAIMED" },
    { id: "n4", type: "kit",      x: 1040, y: 200, title: "Email Subscribed",  subtitle: "Added to Kit sequence",        outputs: ["n5"], eventType: "SUBSCRIBED"      },
    { id: "n5", type: "goal",     x: 1360, y: 200, title: "Purchase Made",     subtitle: "Payment confirmed via Stripe", outputs: [],     eventType: "PURCHASED"       },
  ],
  "call-funnel": [
    { id: "n1", type: "manychat",  x: 80,   y: 220, title: "Instagram Comment", subtitle: "Tracked via ManyChat",           outputs: ["n2"],        eventType: "COMMENT"        },
    { id: "n2", type: "manychat",  x: 400,  y: 220, title: "DM Started",        subtitle: "Tracked via ManyChat",           outputs: ["n3"],        eventType: "DM_STARTED"     },
    { id: "n3", type: "manychat",  x: 720,  y: 220, title: "Link Clicked",      subtitle: "VSL video view tracked",         outputs: ["n4"],        eventType: "LINK_CLICKED"   },
    { id: "n4", type: "calendly",  x: 1040, y: 220, title: "Call Scheduled",    subtitle: "Booking via Calendly",           outputs: ["n5", "n6"], eventType: "CALL_SCHEDULED" },
    { id: "n5", type: "calendly",  x: 1360, y: 100, title: "Call Completed",    subtitle: "Attendance tracked via Calendly",outputs: ["n7"],        eventType: "CALL_COMPLETED" },
    { id: "n6", type: "condition", x: 1360, y: 340, title: "No-Show",           subtitle: "Missed appointment",             outputs: [],            eventType: "CALL_NO_SHOW"   },
    { id: "n7", type: "goal",      x: 1680, y: 100, title: "Purchase Made",     subtitle: "Payment confirmed via Stripe",   outputs: [],            eventType: "PURCHASED"      },
  ],
  new: [
    { id: "n1", type: "manychat", x: 100, y: 200, title: "Instagram Comment", subtitle: "Choose your entry point", outputs: [], eventType: "COMMENT" },
  ],
}

export const MOCK_GA4 = {
  sessions: 4820,
  previousSessions: 3910,
  users: 3241,
  previousUsers: 2758,
  pageViews: 12440,
  engagementRate: 61.4,
  sources: [
    { source: "Organic Search", sessions: 2100, pct: 43.6 },
    { source: "Direct", sessions: 1250, pct: 25.9 },
    { source: "Social", sessions: 870, pct: 18.0 },
    { source: "Referral", sessions: 600, pct: 12.4 },
  ],
  topPages: [
    { path: "/", views: 4200, sessions: 2800 },
    { path: "/offer", views: 2100, sessions: 1400 },
    { path: "/freebie", views: 1800, sessions: 1100 },
    { path: "/about", views: 980, sessions: 620 },
    { path: "/contact", views: 540, sessions: 320 },
  ],
  weeklyData: [
    { week: "W1", sessions: 310 },
    { week: "W2", sessions: 340 },
    { week: "W3", sessions: 290 },
    { week: "W4", sessions: 410 },
    { week: "W5", sessions: 380 },
    { week: "W6", sessions: 450 },
    { week: "W7", sessions: 420 },
    { week: "W8", sessions: 490 },
    { week: "W9", sessions: 510 },
    { week: "W10", sessions: 470 },
    { week: "W11", sessions: 560 },
    { week: "W12", sessions: 590 },
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
