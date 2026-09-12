import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export const metadata: Metadata = { title: "Contacts" }

const STAGE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  COMMENT: { label: "Comment", color: "#4a5164", bg: "#f5f6f8" },
  DM_STARTED: { label: "DM Started", color: "#4a5164", bg: "#f5f6f8" },
  FREEBIE_CLAIMED: { label: "Freebie Claimed", color: "#0b0b0f", bg: "#e2eafc" },
  LINK_CLICKED: { label: "Video Viewed", color: "#0b0b0f", bg: "#e2eafc" },
  SUBSCRIBED: { label: "Subscribed", color: "#0b7a68", bg: "#ccfbf1" },
  CALL_SCHEDULED: { label: "Call Booked", color: "#92400e", bg: "#fef3c7" },
  CALL_COMPLETED: { label: "Call Done", color: "#0b7a68", bg: "#ccfbf1" },
  CALL_NO_SHOW: { label: "No Show", color: "#92400e", bg: "#fef3c7" },
  PURCHASED: { label: "Customer", color: "#166534", bg: "#dcfce7" },
}

const SOURCE_META: Record<string, { label: string; color: string; bg: string }> = {
  manychat: { label: "ManyChat", color: "#0369a1", bg: "#e0f2fe" },
  kit: { label: "Kit", color: "#92400e", bg: "#fef3c7" },
  stripe: { label: "Stripe", color: "#5b21b6", bg: "#f3e8ff" },
  calendly: { label: "Calendly", color: "#0b7a68", bg: "#ccfbf1" },
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

  return (
    <div className="flex flex-col gap-5" style={{ padding: "22px" }}>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.04em] text-cr-black m-0">Contacts</h1>
          <p className="text-[15px] text-cr-text-3 mt-[7px] mb-0">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} · sorted by most recent
          </p>
        </div>
      </div>

      {/* Table */}
      <section style={{ border: "1px solid #edf2fb", borderRadius: "26px", overflow: "hidden" }}>
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center gap-[11px] text-center py-16 px-6">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "#edf2fb" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0b0b0f" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7.6" cy="6.8" r="2.9" />
                <path d="M2.6 16.2c.5-2.8 2.5-4.3 5-4.3s4.5 1.5 5 4.3M13.6 5.2a2.7 2.7 0 0 1 0 5.1M15.3 15.8c-.2-1.6-.8-2.8-1.8-3.6" />
              </svg>
            </div>
            <p className="text-[15px] font-bold text-cr-black">No contacts yet</p>
            <p className="text-[13.5px] text-cr-text-3 max-w-xs">
              Once you connect and sync an integration, your contacts will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #edf2fb" }}>
                {["Contact", "Stage", "Sources", "Joined", "Lifetime Value"].map((h) => (
                  <th
                    key={h}
                    className="text-[11.5px] font-bold tracking-[0.06em] text-cr-text-4 text-left"
                    style={{ padding: "14px 20px" }}
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, i) => {
                const initials = contact.name
                  ? contact.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                  : contact.email?.[0]?.toUpperCase() ?? "?"
                const stageInfo = contact.currentStage ? STAGE_LABELS[contact.currentStage] : null

                return (
                  <tr
                    key={contact.id}
                    style={{ borderTop: i > 0 ? "1px solid #f2f5fb" : "none" }}
                    className="hover:bg-cr-blue-50 transition-colors"
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-[34px] h-[34px] rounded-full bg-cr-blue-600 flex items-center justify-center text-[13px] font-bold text-cr-black shrink-0"
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-cr-black">
                            {contact.name ?? "—"}
                          </div>
                          <div className="text-[12px] text-cr-text-4">{contact.email ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      {stageInfo ? (
                        <span
                          className="inline-flex items-center rounded-full text-[12px] font-semibold px-[9px] py-[3px]"
                          style={{ background: stageInfo.bg, color: stageInfo.color }}
                        >
                          {stageInfo.label}
                        </span>
                      ) : (
                        <span className="text-[13px] text-cr-text-4">—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div className="flex flex-wrap gap-1">
                        {contact.sources.length > 0 ? contact.sources.map((src) => {
                          const sm = SOURCE_META[src]
                          return (
                            <span
                              key={src}
                              className="inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-[3px]"
                              style={{ background: sm?.bg ?? "#f5f6f8", color: sm?.color ?? "#4a5164" }}
                            >
                              {sm?.label ?? src}
                            </span>
                          )
                        }) : (
                          <span className="text-[13px] text-cr-text-4">—</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span className="text-[13px] text-cr-text-3">
                        {formatDistanceToNow(new Date(contact.joinedAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }} className="text-right">
                      <span className="text-[14px] font-semibold text-cr-black">
                        {contact.lifetimeValue > 0 ? formatCurrency(contact.lifetimeValue) : "—"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
