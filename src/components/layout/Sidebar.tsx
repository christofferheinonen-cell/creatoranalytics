"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Plug,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

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
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-brand-indigo-50 text-brand-indigo-600"
          : "text-muted-foreground hover:bg-surface-subtle hover:text-brand-navy"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          isActive ? "text-brand-indigo-500" : "text-muted-foreground"
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
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-indigo-500 to-brand-teal-500">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-brand-navy">
          Creator<span className="text-brand-indigo-500">Analytics</span>
        </span>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        {NAV.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-0.5">
            {group.section && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.section}
              </p>
            )}
            {group.items.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        ))}
      </nav>

      <Separator />

      {/* User profile */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-semibold text-brand-navy">
            {session?.user?.name ?? "Creator"}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            {session?.user?.email}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md p-1 text-muted-foreground hover:bg-surface-subtle hover:text-brand-navy transition-colors"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  )
}
