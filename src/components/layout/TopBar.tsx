"use client"

import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function TopBar() {
  return (
    <header className="flex h-[60px] shrink-0 items-center gap-4 border-b border-[#E2E8F0] bg-white px-6">
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
        <Input
          type="search"
          placeholder="Search contacts…"
          className="h-8 w-56 rounded-lg border-[#E2E8F0] bg-[#F8FAFC] pl-8 text-[13px] placeholder:text-[#94A3B8] focus-visible:ring-1"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-brand-navy transition-colors">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
