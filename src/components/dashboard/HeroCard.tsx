import Link from "next/link"

interface StatTileProps {
  title: string
  subtitle: string
  value: number | string
  badge: string
  bg: string
  badgeBg?: string
}

function StatTile({ title, subtitle, value, badge, bg, badgeBg }: StatTileProps) {
  return (
    <div
      className="relative flex flex-col"
      style={{ background: bg, borderRadius: "26px", padding: "20px 20px 26px", minHeight: "186px" }}
    >
      <div className="text-[17px] font-bold tracking-[-0.02em] text-cr-black">{title}</div>
      <div className="text-[13.5px] mt-[5px] leading-[1.45]" style={{ color: "#6d7688" }}>
        {subtitle}
      </div>
      <div className="mt-auto flex items-end gap-2">
        <span className="text-[40px] font-bold tracking-[-0.04em] leading-none text-cr-black">
          {value}
        </span>
        <span
          className="text-[12.5px] font-semibold text-cr-black mb-1"
          style={{
            background: badgeBg ?? "rgba(255,255,255,.7)",
            borderRadius: "99px",
            padding: "3px 9px",
          }}
        >
          {badge}
        </span>
      </div>
      <Link
        href="/contacts"
        className="absolute flex items-center justify-center text-white hover:bg-cr-blue-600 hover:text-cr-black transition-colors"
        style={{
          right: "-4px",
          bottom: "-4px",
          width: "46px",
          height: "46px",
          borderRadius: "99px",
          background: "#0b0b0f",
          boxShadow: "0 0 0 8px #fff",
        }}
      >
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 14 14 6M7 6h7v7" />
        </svg>
      </Link>
    </div>
  )
}

interface HeroCardProps {
  totalContacts: number
  activeSubscribers: number
  callsBooked: number
  contactsTrend: number
}

export function HeroCard({ totalContacts, activeSubscribers, callsBooked, contactsTrend }: HeroCardProps) {
  const activePct = totalContacts > 0 ? Math.round((activeSubscribers / totalContacts) * 100) : 0

  return (
    <div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
      <StatTile
        title="Contacts"
        subtitle="Leads and subscribers."
        value={totalContacts}
        badge={contactsTrend > 0 ? `+${contactsTrend}` : String(totalContacts)}
        bg="#edf2fb"
      />
      <StatTile
        title="Subscribers"
        subtitle="Current email list."
        value={activeSubscribers}
        badge={`${activePct}% active`}
        bg="#ccdbfd"
        badgeBg="rgba(255,255,255,.72)"
      />
      <StatTile
        title="Calls booked"
        subtitle="Discovery calls this month."
        value={callsBooked === 0 ? "0" : callsBooked}
        badge={callsBooked === 0 ? "Needs setup" : `+${callsBooked}`}
        bg="#f5f6f8"
        badgeBg="#fff"
      />
    </div>
  )
}
