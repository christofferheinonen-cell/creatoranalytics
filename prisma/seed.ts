import { PrismaClient, FunnelEventType } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding default funnel definitions...")

  // Freebie funnel: DM bot sends a lead magnet link → email capture → eventual purchase
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

  // Call funnel: DM bot sends a YouTube link → Calendly booking → manual payment on call
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

  console.log("Done. Default funnels seeded.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
