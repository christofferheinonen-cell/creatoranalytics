import type { Metadata } from "next"
import { Users } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatCurrency } from "@/lib/utils"

export const metadata: Metadata = { title: "Contacts" }

const STAGE_LABELS: Record<string, { label: string; variant: "default" | "teal" | "success" | "secondary" | "warning" }> = {
  COMMENT: { label: "Comment", variant: "secondary" },
  DM_STARTED: { label: "DM Started", variant: "secondary" },
  FREEBIE_CLAIMED: { label: "Freebie Claimed", variant: "default" },
  LINK_CLICKED: { label: "Video Viewed", variant: "default" },
  SUBSCRIBED: { label: "Subscribed", variant: "teal" },
  CALL_SCHEDULED: { label: "Call Booked", variant: "warning" },
  CALL_COMPLETED: { label: "Call Done", variant: "teal" },
  CALL_NO_SHOW: { label: "No Show", variant: "warning" },
  PURCHASED: { label: "Customer", variant: "success" },
}

const SOURCE_COLORS: Record<string, string> = {
  manychat: "bg-sky-100 text-sky-700",
  kit: "bg-orange-100 text-orange-700",
  stripe: "bg-violet-100 text-violet-700",
  calendly: "bg-teal-100 text-teal-700",
}

export default async function ContactsPage() {
  const session = await auth()
  const userId = session!.user.id

  const rows = await prisma.contact.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      email: true,
      currentStage: true,
      lifetimeValue: true,
      createdAt: true,
      stripeCustomerId: true,
      kitSubscriberId: true,
      manychatUserId: true,
      calendlyInviteeId: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const contacts = rows.map((c) => {
    const sources: string[] = []
    if (c.manychatUserId) sources.push("manychat")
    if (c.kitSubscriberId) sources.push("kit")
    if (c.calendlyInviteeId) sources.push("calendly")
    if (c.stripeCustomerId) sources.push("stripe")
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      currentStage: c.currentStage,
      lifetimeValue: c.lifetimeValue.toNumber(),
      joinedAt: c.createdAt.toISOString(),
      sources,
    }
  })

  if (contacts.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No contacts yet"
          description="Once you connect and sync an integration, your contacts will appear here."
        />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">Contacts</h2>
          <p className="text-xs text-muted-foreground">
            {contacts.length} contacts · sorted by most recent
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>All Contacts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Sources</TableHead>
                <TableHead className="text-right pr-5">Lifetime Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => {
                const initials = contact.name
                  ? contact.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                  : contact.email?.[0]?.toUpperCase() ?? "?"
                const stageInfo = contact.currentStage
                  ? STAGE_LABELS[contact.currentStage]
                  : null

                return (
                  <TableRow key={contact.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-brand-navy">
                            {contact.name ?? "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {contact.email ?? "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {stageInfo ? (
                        <Badge variant={stageInfo.variant}>
                          {stageInfo.label}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.sources.length > 0 ? contact.sources.map((src) => (
                          <span
                            key={src}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_COLORS[src] ?? "bg-surface-subtle text-muted-foreground"}`}
                          >
                            {src}
                          </span>
                        )) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <span className="text-sm font-semibold text-brand-navy">
                        {contact.lifetimeValue > 0
                          ? formatCurrency(contact.lifetimeValue)
                          : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
