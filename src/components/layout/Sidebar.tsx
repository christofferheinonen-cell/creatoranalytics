"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Plug,
  Settings,
  BarChart2,
  Filter,
  Link2,
  Smartphone,
  Cloud,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ANALYTICS_NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users, badge: null },
  { label: "Funnels", href: "/funnels", icon: Filter },
  { label: "Revenue", href: "/revenue", icon: BarChart2 },
]

const WORKSPACE_NAV = [
  { label: "Integrations", href: "/integrations", icon: Link2, dot: true },
  { label: "Settings", href: "/settings", icon: Settings },
]

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  dot,
}: {
  href: string
  icon: React.ElementType
  label: string
  badge?: number | null
  dot?: boolean
}) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-[11px] h-10 px-3 rounded-xl text-[14px] font-medium transition-colors",
        isActive
          ? "bg-cr-blue-100 text-cr-black font-semibold"
          : "text-cr-text-2 hover:bg-cr-blue-50 hover:text-cr-black"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          isActive ? "text-cr-black" : "text-current"
        )}
        strokeWidth={1.5}
      />
      {label}
      {badge != null && (
        <span className="ml-auto text-[11.5px] font-bold text-cr-black bg-cr-blue-200 px-2 py-0.5 rounded-[7px]">
          {badge}
        </span>
      )}
      {dot && (
        <span className="ml-auto w-[7px] h-[7px] rounded-full bg-cr-blue-600" />
      )}
    </Link>
  )
}

export function Sidebar() {
  const { data: session } = useSession()

  return (
    <aside
      className="flex flex-col gap-5 shrink-0 h-full"
      style={{
        width: "248px",
        minWidth: "214px",
        background: "#fbfcff",
        borderRight: "1px solid #edf2fb",
        padding: "22px 16px",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-[10px]">
        <div
          className="w-[30px] h-[30px] rounded-full bg-cr-blue-600 flex items-center justify-center shrink-0"
        >
          <div
            className="w-[13px] h-[13px] rounded-full border-[3.5px] border-cr-black"
            style={{ borderRightColor: "transparent", transform: "rotate(-45deg)" }}
          />
        </div>
        <span className="text-[16.5px] font-extrabold tracking-[-0.035em] text-cr-black">
          Creatorly
        </span>
        <button
          className="ml-auto w-[26px] h-[26px] rounded-lg border-none bg-transparent flex items-center justify-center hover:bg-cr-blue-100 transition-colors cursor-pointer"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4 text-cr-text-3" strokeWidth={1.6} />
        </button>
      </div>

      {/* New funnel CTA */}
      <button
        className="flex items-center justify-center gap-[9px] w-full h-[46px] rounded-full bg-cr-black text-white text-[14px] font-semibold cursor-pointer hover:bg-cr-dark transition-colors border-none"
        onClick={() => window.location.href = "/funnels"}
      >
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
          <path d="M10 3.2 11.4 7 15 8.4 11.4 9.8 10 13.6 8.6 9.8 5 8.4 8.6 7z" stroke="#abc4ff" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M15.2 13.4 16 15.2l1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" stroke="#abc4ff" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        New funnel
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <p className="text-[10.5px] font-bold tracking-[0.12em] text-cr-text-4 px-[10px] pb-[6px] pt-1">
          ANALYTICS
        </p>
        {ANALYTICS_NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        <p className="text-[10.5px] font-bold tracking-[0.12em] text-cr-text-4 px-[10px] pb-[6px] pt-[18px]">
          WORKSPACE
        </p>
        {WORKSPACE_NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-[14px]">
        {/* Plan */}
        <div className="flex items-center gap-[9px]">
          <Cloud className="h-[18px] w-[18px] text-cr-black shrink-0" strokeWidth={1.5} />
          <span className="text-[13.5px] font-semibold text-cr-black">Starter</span>
          <a
            href="/settings"
            className="ml-auto text-[12.5px] font-semibold border border-cr-gray-200 rounded-full px-3 py-[5px] hover:bg-cr-blue-100 hover:text-cr-black transition-colors text-cr-black"
          >
            Upgrade
          </a>
        </div>

        {/* Usage bar */}
        <div>
          <div className="h-1 rounded-full bg-cr-blue-100 overflow-hidden">
            <div className="w-[8%] h-full bg-cr-black rounded-full" />
          </div>
          <p className="text-[12px] text-cr-text-3 mt-[9px]">2 of 25 contacts used</p>
        </div>

        {/* Mobile app */}
        <div
          className="flex items-center justify-center gap-[9px]"
          style={{ borderTop: "1px solid #edf2fb", paddingTop: "14px" }}
        >
          <Smartphone className="h-[17px] w-[17px] text-cr-black" strokeWidth={1.5} />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[13.5px] font-semibold text-cr-black hover:underline flex items-center gap-2 bg-transparent border-none cursor-pointer"
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
