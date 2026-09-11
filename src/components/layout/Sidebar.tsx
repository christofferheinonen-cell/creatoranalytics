"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Plug,
  LogOut,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const NAV = [
  {
    section: null,
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    section: "Analytics",
    items: [
      { label: "Contacts", href: "/contacts", icon: Users },
      { label: "Funnels", href: "/funnels", icon: TrendingUp },
    ],
  },
  {
    section: "Settings",
    items: [{ label: "Integrations", href: "/integrations", icon: Plug }],
  },
]

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ElementType
  label: string
}) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-brand-indigo-50 font-medium text-brand-indigo-600"
          : "font-normal text-[#64748B] hover:bg-[#F1F5F9] hover:text-brand-navy"
      )}
    >
      <Icon
        className={cn(
          "h-[15px] w-[15px] shrink-0",
          isActive ? "text-brand-indigo-500" : "text-[#94A3B8]"
        )}
      />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const { data: session } = useSession()
  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "U"

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-[#E2E8F0] bg-white">
      {/* Logo */}
      <div className="flex h-[60px] items-center gap-2.5 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-indigo-500">
          <TrendingUp className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[13px] font-semibold text-brand-navy">
          Creator<span className="text-brand-indigo-500">Analytics</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
        {NAV.map((group, gi) => (
          <div key={gi} className={cn("flex flex-col gap-0.5", gi > 0 && "mt-5")}>
            {group.section && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                {group.section}
              </p>
            )}
            {group.items.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-[#E2E8F0] p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-[10px] font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[12px] font-semibold text-brand-navy">
              {session?.user?.name ?? "Creator"}
            </span>
            <span className="truncate text-[10px] text-[#94A3B8]">
              {session?.user?.email}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-brand-navy transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
