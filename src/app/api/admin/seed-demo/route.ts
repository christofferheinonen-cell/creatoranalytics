// TEMPORARY — delete this file after running once
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const SECRET = "seed-chrishein430-once"

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
]

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez",
  "Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore",
  "Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez",
  "Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen",
  "Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell",
]

function fakeName(rng: () => number) {
  const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]
  const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]
  return { first, last, full: `${first} ${last}` }
}

function fakeEmail(first: string, last: string, idx: number): string {
  const domains = ["gmail.com","yahoo.com","outlook.com","icloud.com","hotmail.com"]
  const rng = seededRng(idx * 7 + 1337)
  const domain = domains[Math.floor(rng() * domains.length)]
  return `${first.toLowerCase()}.${last.toLowerCase()}${idx}@${domain}`
}

const PURCHASE_AMOUNTS = [297, 497, 597, 797, 997, 1497, 1997]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const DEMO_USER_ID = "demo-seed-chrishein430"
  const DEMO_EMAIL = "chrishein430@gmail.com"

  const existingByEmail = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })
  if (existingByEmail && existingByEmail.id !== DEMO_USER_ID) {
    return NextResponse.json({ error: "Email exists under a different ID — skipped." })
  }

  const passwordHash = await bcrypt.hash("Test123@", 10)

  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: { id: DEMO_USER_ID, email: DEMO_EMAIL, name: "Chris Heinonen", passwordHash },
  })

  const accounts: Array<{ id: string; provider: "MANYCHAT"|"KIT"|"STRIPE"|"CALENDLY" }> = [
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

  const REACH_COUNTS = [300, 232, 134, 82, 48, 32, 24, 18]
  const STAGES: Array<{ type: string; source: string }> = [
    { type: "COMMENT",         source: "MANYCHAT" },
    { type: "DM_STARTED",      source: "MANYCHAT" },
    { type: "FREEBIE_CLAIMED", source: "MANYCHAT" },
    { type: "SUBSCRIBED",      source: "KIT"      },
    { type: "LINK_CLICKED",    source: "MANYCHAT" },
    { type: "CALL_SCHEDULED",  source: "CALENDLY" },
    { type: "CALL_COMPLETED",  source: "CALENDLY" },
    { type: "PURCHASED",       source: "STRIPE"   },
  ]

  const rng = seededRng(42)
  let contactsCreated = 0
  let eventsCreated = 0

  for (let i = 0; i < 300; i++) {
    const contactId = `demo-contact-${i}`
    const nameObj = fakeName(rng)
    const email = fakeEmail(nameObj.first, nameObj.last, i)

    let deepestIdx = 0
    for (let s = 0; s < STAGES.length; s++) {
      if (i < REACH_COUNTS[s]) deepestIdx = s
      else break
    }

    const isNoShow = i >= 24 && i < 32
    const currentStage = isNoShow ? "CALL_NO_SHOW" : STAGES[deepestIdx].type
    const daysBack = Math.floor(rng() * 170) + 5
    const baseDate = daysAgo(daysBack)
    const purchaseValue = deepestIdx >= 7
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
        calendlyInviteeId: (deepestIdx >= 5 || isNoShow) ? `cal-${i}` : null,
        stripeCustomerId: deepestIdx >= 7 ? `cus_demo${i}` : null,
        currentStage: currentStage as never,
        lifetimeValue: purchaseValue,
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    })
    contactsCreated++

    let ts = new Date(baseDate)
    for (let s = 0; s <= deepestIdx; s++) {
      await prisma.funnelEvent.upsert({
        where: { id: `demo-evt-${i}-${STAGES[s].type}` },
        update: {},
        create: {
          id: `demo-evt-${i}-${STAGES[s].type}`,
          contactId,
          userId: DEMO_USER_ID,
          type: STAGES[s].type as never,
          source: STAGES[s].source as never,
          timestamp: ts,
          value: STAGES[s].type === "PURCHASED" ? purchaseValue : null,
        },
      })
      eventsCreated++
      ts = new Date(ts.getTime() + (1 + Math.floor(rng() * 5)) * 24 * 60 * 60 * 1000)
    }

    if (isNoShow) {
      await prisma.funnelEvent.upsert({
        where: { id: `demo-evt-${i}-CALL_NO_SHOW` },
        update: {},
        create: {
          id: `demo-evt-${i}-CALL_NO_SHOW`,
          contactId,
          userId: DEMO_USER_ID,
          type: "CALL_NO_SHOW" as never,
          source: "CALENDLY" as never,
          timestamp: new Date(ts.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
      })
      eventsCreated++
    }
  }

  return NextResponse.json({
    ok: true,
    contactsCreated,
    eventsCreated,
    message: `Demo user ${DEMO_EMAIL} seeded. Delete /api/admin/seed-demo now.`,
  })
}
