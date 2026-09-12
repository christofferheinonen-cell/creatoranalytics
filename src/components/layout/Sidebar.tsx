"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Filter,
  Link2,
  Settings,
  Cloud,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const ANALYTICS_NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Funnels", href: "/funnels", icon: Filter },
  { label: "Revenue", href: "/revenue", icon: BarChart2 },
]

const WORKSPACE_NAV = [
  { label: "Integrations", href: "/integrations", icon: Link2 },
  { label: "Settings", href: "/settings", icon: Settings },
]

function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
}: {
  href: string
  icon: React.ElementType
  label: string
  collapsed: boolean
}) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-[11px] h-10 px-3 rounded-xl text-[14px] font-medium transition-colors",
        collapsed && "justify-center",
        isActive
          ? "bg-cr-blue-100 text-cr-black font-semibold"
          : "text-cr-text-2 hover:bg-cr-blue-50 hover:text-cr-black"
      )}
      style={
        isActive
          ? { backgroundColor: "color-mix(in srgb, var(--sidebar-bg) 0%, #edf2fb 100%)" }
          : undefined
      }
    >
      <Icon
        className={cn("shrink-0", isActive ? "text-cr-black" : "text-current")}
        style={{ width: 18, height: 18 }}
        strokeWidth={1.5}
      />
      {!collapsed && label}
    </Link>
  )
}

export function Sidebar() {
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "U"

  return (
    <aside
      className="flex flex-col gap-5 shrink-0 h-full overflow-y-auto transition-[width] duration-200"
      style={{
        width: collapsed ? 64 : 248,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        padding: collapsed ? "22px 8px" : "22px 16px",
      }}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-[10px]", collapsed && "justify-center")}>
        <div
          className="w-[30px] h-[30px] rounded-full bg-cr-blue-600 flex items-center justify-center shrink-0"
        >
          <div
            className="w-[13px] h-[13px] rounded-full border-[3.5px] border-cr-black"
            style={{ borderRightColor: "transparent", transform: "rotate(-45deg)" }}
          />
        </div>
        {!collapsed && (
          <span
            className="text-[16.5px] font-extrabold tracking-[-0.035em]"
            style={{ color: "var(--text-primary)" }}
          >
            Creatorly
          </span>
        )}
        <button
          className={cn(
            "w-[26px] h-[26px] rounded-lg border-none bg-transparent flex items-center justify-center hover:bg-cr-blue-100 transition-colors cursor-pointer",
            !collapsed && "ml-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-cr-text-3" strokeWidth={1.6} />
          ) : (
            <ChevronLeft className="h-4 w-4 text-cr-text-3" strokeWidth={1.6} />
          )}
        </button>
      </div>

      {/* New funnel CTA */}
      <Link
        href="/funnels"
        className={cn(
          "flex items-center justify-center gap-[9px] w-full h-[46px] rounded-full text-white text-[14px] font-semibold hover:opacity-90 transition-opacity",
          collapsed && "px-0"
        )}
        style={{ background: "var(--text-primary)" }}
        title={collapsed ? "New funnel" : undefined}
      >
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <path d="M10 3.2 11.4 7 15 8.4 11.4 9.8 10 13.6 8.6 9.8 5 8.4 8.6 7z" stroke="#abc4ff" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M15.2 13.4 16 15.2l1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" stroke="#abc4ff" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        {!collapsed && "New funnel"}
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {!collapsed && (
          <p
            className="text-[10.5px] font-bold tracking-[0.12em] px-[10px] pb-[6px] pt-1"
            style={{ color: "var(--text-quaternary)" }}
          >
            ANALYTICS
          </p>
        )}
        {ANALYTICS_NAV.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <p
            className="text-[10.5px] font-bold tracking-[0.12em] px-[10px] pb-[6px] pt-[18px]"
            style={{ color: "var(--text-quaternary)" }}
          >
            WORKSPACE
          </p>
        )}
        {collapsed && <div className="my-2 border-t" style={{ borderColor: "var(--sidebar-border)" }} />}
        {WORKSPACE_NAV.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="mt-auto flex flex-col gap-[14px]">
          <div className="flex items-center gap-[9px]">
            <Cloud className="h-[18px] w-[18px] shrink-0" style={{ color: "var(--text-primary)" }} strokeWidth={1.5} />
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Starter
            </span>
            <Link
              href="/settings"
              className="ml-auto text-[12.5px] font-semibold rounded-full px-3 py-[5px] hover:bg-cr-blue-100 transition-colors"
              style={{ border: "1px solid var(--sidebar-border)", color: "var(--text-primary)" }}
            >
              Upgrade
            </Link>
          </div>

          <div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--topbar-control-border)" }}>
              <div className="w-[8%] h-full rounded-full" style={{ background: "var(--text-primary)" }} />
            </div>
            <p className="text-[12px] mt-[9px]" style={{ color: "var(--text-tertiary)" }}>
              2 of 25 contacts used
            </p>
          </div>

          <div
            className="flex items-center justify-center gap-[9px]"
            style={{ borderTop: "1px solid var(--sidebar-border)", paddingTop: "14px" }}
          >
            <div
              className="w-[30px] h-[30px] rounded-full bg-cr-blue-600 flex items-center justify-center text-[12px] font-bold text-cr-black select-none shrink-0"
              title={session?.user?.name ?? "User"}
            >
              {initials}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-[13px] font-semibold hover:underline flex items-center gap-2 bg-transparent border-none cursor-pointer min-w-0 truncate"
              style={{ color: "var(--text-primary)" }}
              title="Sign out"
            >
              Sign out
            </button>
            <LogOut className="h-[15px] w-[15px] shrink-0 ml-auto" style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />
          </div>
        </div>
      )}

      {/* Collapsed footer: sign out only */}
      {collapsed && (
        <div className="mt-auto flex flex-col items-center gap-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-cr-blue-100 transition-colors border-none bg-transparent cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-[17px] w-[17px]" style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </aside>
  )
}
