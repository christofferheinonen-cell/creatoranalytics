"use client"

import { Bell, Search } from "lucide-react"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/contacts": "Contacts",
  "/funnels": "Funnels",
  "/integrations": "Integrations",
  "/account": "Account",
}

export function TopBar() {
  const pathname = usePathname()
  const title = TITLES[pathname] ?? "Dashboard"

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface-card px-6">
      <h1 className="text-base font-semibold text-brand-navy">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts…"
            className="h-8 w-52 pl-8 text-xs"
          />
        </div>

        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-subtle hover:text-brand-navy transition-colors">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
