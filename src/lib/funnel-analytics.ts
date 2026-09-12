import { prisma } from "@/lib/prisma"
import type { MockBuilderNode } from "@/lib/mock-data"
import type { FunnelEventType } from "@/types"

export interface FunnelStageResult {
  eventType: string
  label: string
  source: string
  count: number
}

/**
 * Walk the node graph (DFS from roots) and return the ordered list of tracking
 * stages — nodes that have a real eventType. Condition/goal marker nodes without
 * an eventType are traversed but not included in the stage list.
 */
export function extractFunnelStages(
  nodes: MockBuilderNode[]
): { eventType: string; label: string; source: string }[] {
  if (!nodes.length) return []

  // Roots = nodes with no incoming edges
  const hasIncoming = new Set(nodes.flatMap((n) => n.outputs))
  const roots = nodes.filter((n) => !hasIncoming.has(n.id))
  const startNodes = roots.length > 0 ? roots : [nodes[0]]

  const visited = new Set<string>()
  const stages: { eventType: string; label: string; source: string }[] = []

  function walk(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    if (node.eventType) {
      stages.push({ eventType: node.eventType, label: node.title, source: node.type })
    }
    for (const outId of node.outputs) walk(outId)
  }

  for (const root of startNodes) walk(root.id)
  return stages
}

/**
 * Given an ordered list of stages, query distinct contact counts per event type
 * for a user. Returns counts in the same order as the input stages.
 */
export async function getFunnelStageCounts(
  userId: string,
  stages: { eventType: string; label: string; source: string }[]
): Promise<FunnelStageResult[]> {
  if (!stages.length) return []

  const eventTypes = stages.map((s) => s.eventType)

  // One query: fetch (type, contactId) distinct pairs for the relevant event types
  const rows = await prisma.funnelEvent.findMany({
    where: {
      userId,
      type: { in: eventTypes as FunnelEventType[] },
    },
    select: { type: true, contactId: true },
    distinct: ["type", "contactId"],
  })

  // Count distinct contacts per event type
  const countByType = new Map<string, number>()
  for (const row of rows) {
    countByType.set(row.type, (countByType.get(row.type) ?? 0) + 1)
  }

  return stages.map((s) => ({
    ...s,
    count: countByType.get(s.eventType) ?? 0,
  }))
}
