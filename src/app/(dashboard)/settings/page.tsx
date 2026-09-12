import type { Metadata } from "next"
import { auth } from "@/auth"
import Link from "next/link"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const session = await auth()
  const user = session!.user

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "U"

  return (
    <div className="flex flex-col gap-5" style={{ padding: "22px" }}>
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.04em] text-cr-black m-0">Settings</h1>
        <p className="text-[15px] text-cr-text-3 mt-[7px] mb-0">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile */}
      <section style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px" }}>
        <h2 className="text-[17px] font-bold tracking-[-0.025em] text-cr-black m-0 mb-[16px]">
          Profile
        </h2>
        <div className="flex items-center gap-4">
          <div
            className="w-[52px] h-[52px] rounded-full bg-cr-blue-600 flex items-center justify-center text-[18px] font-bold text-cr-black shrink-0"
          >
            {initials}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-cr-black">{user.name ?? "—"}</div>
            <div className="text-[13px] text-cr-text-3">{user.email}</div>
          </div>
        </div>
      </section>

      {/* Plan */}
      <section style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px" }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-bold tracking-[-0.025em] text-cr-black m-0">
              Current plan
            </h2>
            <p className="text-[13px] text-cr-text-3 mt-[5px] mb-0">Starter · 25 contacts included</p>
          </div>
          <span
            className="text-[11px] font-bold tracking-[0.1em] text-cr-black rounded-full px-3 py-1"
            style={{ background: "#e2eafc" }}
          >
            FREE
          </span>
        </div>

        <div className="mt-4">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "#edf2fb" }}>
            <div className="w-[8%] h-full rounded-full" style={{ background: "#0b0b0f" }} />
          </div>
          <p className="text-[12px] text-cr-text-3 mt-2">2 of 25 contacts used</p>
        </div>

        <div
          className="flex items-center gap-[14px] mt-4 flex-wrap"
          style={{ background: "#0b0b0f", borderRadius: "18px", padding: "16px 20px", color: "#fff" }}
        >
          <span
            className="text-[11px] font-bold tracking-[0.12em] text-cr-blue-600 rounded-full px-[11px] py-1"
            style={{ border: "1px solid rgba(171,196,255,.35)" }}
          >
            PRO
          </span>
          <div className="flex-1 min-w-[200px]">
            <div className="text-[15px] font-semibold">Upgrade to Pro</div>
            <div className="text-[12px] text-cr-text-4 mt-1">
              Unlimited contacts, automated attribution, advanced funnels
            </div>
          </div>
          <button
            className="flex items-center gap-2 text-[13.5px] font-semibold text-cr-black rounded-full px-4 py-[9px] whitespace-nowrap hover:bg-white transition-colors"
            style={{ background: "#abc4ff" }}
          >
            Upgrade now
          </button>
        </div>
      </section>

      {/* Integrations shortcut */}
      <section style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px" }}>
        <h2 className="text-[17px] font-bold tracking-[-0.025em] text-cr-black m-0 mb-[5px]">
          Integrations
        </h2>
        <p className="text-[13px] text-cr-text-3 mb-[16px]">
          Connect Stripe, Kit, ManyChat, and Calendly to power your analytics.
        </p>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white rounded-full px-4 py-[9px] hover:opacity-90 transition-opacity"
          style={{ background: "#0b0b0f" }}
        >
          Manage integrations
        </Link>
      </section>
    </div>
  )
}
