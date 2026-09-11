import { PrismaClient, FunnelEventType, EventSource } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return Math.abs(s) / 0xffffffff
  }
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

const FIRST_NAMES = [
  "Emma","Liam","Olivia","Noah","Ava","Oliver","Sophia","Elijah","Isabella","James",
  "Mia","William","Charlotte","Benjamin","Amelia","Lucas","Harper","Henry","Evelyn",
  "Alexander","Abigail","Mason","Emily","Ethan","Elizabeth","Daniel","Sofia","Jacob",
  "Ella","Logan","Madison","Jackson","Scarlett","Sebastian","Victoria","Jack","Aria",
  "Aiden","Grace","Owen","Chloe","Samuel","Penelope","Ryan","Layla","Nathan","Riley",
  "Dylan","Zoey","Gabriel","Nora","Anthony","Lily","Julian","Eleanor","Wyatt","Hannah",
  "David","Lillian","Andrew","Addison","Isaiah","Aubrey","Zachary","Ellie","Caleb","Stella",
]

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez",
  "Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore",
  "Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez",
  "Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen",
  "Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell",
  "Carter","Roberts","Turner","Phillips","Evans","Collins","Stewart","Morris","Morales",
  "Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey",
]

function fakeName(rng: () => number) {
  const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]
  const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]
  return { first, last, full: `${first} ${last}` }
}

function fakeEmail(first: string, last: string, idx: number): string {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "hotmail.com"]
  const rng = seededRng(idx * 7 + 1337)
  const domain = domains[Math.floor(rng() * domains.length)]
  return `${first.toLowerCase()}.${last.toLowerCase()}${idx}@${domain}`
}

const PURCHASE_AMOUNTS = [297, 497, 597, 797, 997, 1497, 1997]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── 1. System funnel definitions (idempotent) ───────────────────────────────

  console.log("Seeding default funnel definitions…")

  await prisma.funnelDefinition.upsert({
    where: { id: "seed-freebie-funnel" },
    update: {},
    create: {
      id: "seed-freebie-funnel",
      userId: null,
      name: "Freebie Funnel",
      description:
        "Comment → DM → freebie claim → email subscriber → paying customer (self-serve checkout)",
      stages: [
        FunnelEventType.COMMENT,
        FunnelEventType.DM_STARTED,
        FunnelEventType.FREEBIE_CLAIMED,
        FunnelEventType.SUBSCRIBED,
        FunnelEventType.PURCHASED,
      ] satisfies FunnelEventType[],
      isDefault: true,
    },
  })

  await prisma.funnelDefinition.upsert({
    where: { id: "seed-call-funnel" },
    update: {},
    create: {
      id: "seed-call-funnel",
      userId: null,
      name: "Call Funnel",
      description:
        "Comment → DM → video viewed → call booked (Calendly) → payment collected on/after call (Stripe)",
      stages: [
        FunnelEventType.COMMENT,
        FunnelEventType.DM_STARTED,
        FunnelEventType.LINK_CLICKED,
        FunnelEventType.CALL_SCHEDULED,
        FunnelEventType.CALL_COMPLETED,
        FunnelEventType.PURCHASED,
      ] satisfies FunnelEventType[],
      isDefault: true,
    },
  })

  // ── 2. Demo user ────────────────────────────────────────────────────────────

  const DEMO_USER_ID = "demo-seed-chrishein430"
  const DEMO_EMAIL = "chrishein430@gmail.com"

  // Guard: if the email was registered manually under a different ID, don't overwrite
  const existingByEmail = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })
  if (existingByEmail && existingByEmail.id !== DEMO_USER_ID) {
    console.log(`${DEMO_EMAIL} already exists under a different ID — skipping demo data.`)
    console.log("Done.")
    return
  }

  console.log(`Seeding demo user ${DEMO_EMAIL}…`)

  const passwordHash = await bcrypt.hash("Test123@", 12)

  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      name: "Chris Heinonen",
      passwordHash,
    },
  })

  // ── 3. Connected accounts ───────────────────────────────────────────────────

  const accounts: Array<{ id: string; provider: "MANYCHAT" | "KIT" | "STRIPE" | "CALENDLY" }> = [
    { id: "demo-acct-manychat", provider: "MANYCHAT" },
    { id: "demo-acct-kit",      provider: "KIT" },
    { id: "demo-acct-stripe",   provider: "STRIPE" },
    { id: "demo-acct-calendly", provider: "CALENDLY" },
  ]

  for (const acct of accounts) {
    await prisma.connectedAccount.upsert({
      where: { id: acct.id },
      update: {},
      create: {
        id: acct.id,
        userId: DEMO_USER_ID,
        provider: acct.provider,
        apiKey: `demo-key-${acct.provider.toLowerCase()}`,
        status: "ACTIVE",
        lastSyncedAt: daysAgo(1),
      },
    })
  }

  // ── 4. Contacts + funnel events ─────────────────────────────────────────────
  //
  // Funnel shape — realistic coaching/creator conversion rates:
  //
  //   Stage             Count   Notes
  //   COMMENT           300     top of funnel
  //   DM_STARTED        232     77% of comments
  //   FREEBIE_CLAIMED   134     58% of DMs
  //   SUBSCRIBED         82     61% of freebies → email list (Kit)
  //   LINK_CLICKED       48     59% click YouTube/VSL link
  //   CALL_SCHEDULED     32     67% book a call (Calendly)
  //   CALL_COMPLETED     24     75% of scheduled show up
  //   CALL_NO_SHOW        8     25% of scheduled don't show (contacts 24-31)
  //   PURCHASED          18     75% of completed pay (Stripe)

  const rng = seededRng(42)

  // How many contacts reach each stage (indexed 0..7 = COMMENT..PURCHASED)
  // Contact i reaches stage s when i < REACH_COUNTS[s]
  const REACH_COUNTS = [300, 232, 134, 82, 48, 32, 24, 18]

  const STAGES: Array<{ type: FunnelEventType; source: EventSource }> = [
    { type: "COMMENT",         source: "MANYCHAT" },
    { type: "DM_STARTED",      source: "MANYCHAT" },
    { type: "FREEBIE_CLAIMED", source: "MANYCHAT" },
    { type: "SUBSCRIBED",      source: "KIT"      },
    { type: "LINK_CLICKED",    source: "MANYCHAT" },
    { type: "CALL_SCHEDULED",  source: "CALENDLY" },
    { type: "CALL_COMPLETED",  source: "CALENDLY" },
    { type: "PURCHASED",       source: "STRIPE"   },
  ]

  const TOTAL_CONTACTS = 300

  for (let i = 0; i < TOTAL_CONTACTS; i++) {
    const contactId = `demo-contact-${i}`
    const nameObj = fakeName(rng)
    const email = fakeEmail(nameObj.first, nameObj.last, i)

    // Deepest stage index this contact reaches
    let deepestIdx = 0
    for (let s = 0; s < STAGES.length; s++) {
      if (i < REACH_COUNTS[s]) deepestIdx = s
      else break
    }

    const isNoShow = i >= 24 && i < 32 // scheduled but didn't show

    // Contacts 24-31: deepestIdx = 5 (CALL_SCHEDULED); no-show replaces CALL_COMPLETED
    const currentStage: FunnelEventType = isNoShow
      ? "CALL_NO_SHOW"
      : STAGES[deepestIdx].type

    // Spread join dates over the last 6 months with slight recency lean
    const daysBack = Math.floor(rng() * 170) + 5
    const baseDate = daysAgo(daysBack)

    const purchaseValue =
      deepestIdx >= 7
        ? PURCHASE_AMOUNTS[Math.floor(rng() * PURCHASE_AMOUNTS.length)]
        : 0

    await prisma.contact.upsert({
      where: { id: contactId },
      update: {},
      create: {
        id: contactId,
        userId: DEMO_USER_ID,
        email,
        name: nameObj.full,
        manychatUserId: `mc-${i}`,
        kitSubscriberId: deepestIdx >= 3 ? `kit-${i}` : null,
        calendlyInviteeId: deepestIdx >= 5 || isNoShow ? `cal-${i}` : null,
        stripeCustomerId: deepestIdx >= 7 ? `cus_demo${i}` : null,
        currentStage,
        lifetimeValue: purchaseValue,
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    })

    // Create an event for each stage reached
    let ts = new Date(baseDate)

    for (let s = 0; s <= deepestIdx; s++) {
      await prisma.funnelEvent.upsert({
        where: { id: `demo-evt-${i}-${STAGES[s].type}` },
        update: {},
        create: {
          id: `demo-evt-${i}-${STAGES[s].type}`,
          contactId,
          userId: DEMO_USER_ID,
          type: STAGES[s].type,
          source: STAGES[s].source,
          timestamp: ts,
          value: STAGES[s].type === "PURCHASED" ? purchaseValue : null,
        },
      })

      // Advance 1–6 days between stages
      ts = new Date(ts.getTime() + (1 + Math.floor(rng() * 5)) * 24 * 60 * 60 * 1000)
    }

    // Add CALL_NO_SHOW for contacts who scheduled but didn't attend
    if (isNoShow) {
      const callTs = new Date(ts.getTime() + 2 * 24 * 60 * 60 * 1000)
      await prisma.funnelEvent.upsert({
        where: { id: `demo-evt-${i}-CALL_NO_SHOW` },
        update: {},
        create: {
          id: `demo-evt-${i}-CALL_NO_SHOW`,
          contactId,
          userId: DEMO_USER_ID,
          type: "CALL_NO_SHOW",
          source: "CALENDLY",
          timestamp: callTs,
        },
      })
    }
  }

  console.log(`Seeded ${TOTAL_CONTACTS} contacts + funnel events for ${DEMO_EMAIL}.`)
  console.log("Done.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
