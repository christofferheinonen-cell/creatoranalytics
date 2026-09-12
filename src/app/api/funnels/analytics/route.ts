import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { getFunnelStageCounts } from "@/lib/funnel-analytics"

const StageSchema = z.object({
  eventType: z.string(),
  label: z.string(),
  source: z.string(),
})

const BodySchema = z.object({
  stages: z.array(StageSchema).min(1).max(20),
})

// POST /api/funnels/analytics
// Stateless: takes any stage list from the client (saved or unsaved funnel),
// queries real FunnelEvent counts for the authenticated user, returns per-stage counts.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const results = await getFunnelStageCounts(session.user.id, parsed.data.stages)
  return NextResponse.json({ stages: results })
}
