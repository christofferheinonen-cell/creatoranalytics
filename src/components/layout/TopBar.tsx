"use client"

import { Bell, Settings, Search, Sun, Moon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useTheme } from "@/components/providers/ThemeProvider"
import { NotificationPanel } from "@/components/ui/notification-panel"
import { useRouter } from "next/navigation"

export function TopBar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "U"

  return (
    <header
      className="flex items-center gap-3 flex-wrap shrink-0"
      style={{ padding: "18px 22px", borderBottom: "none" }}
    >
      {/* Search */}
      <label
        className="flex items-center gap-[10px] flex-1 min-w-0 h-12 px-5 cursor-text"
        style={{
          background: "var(--topbar-control-bg)",
          border: "1px solid var(--topbar-control-border)",
          borderRadius: "99px",
          minWidth: "260px",
        }}
      >
        <input
          type="text"
          placeholder="Search contacts, funnels or payments"
          className="border-none outline-none bg-transparent font-[inherit] text-[14px] w-full min-w-0 placeholder:text-cr-text-4"
          style={{ color: "var(--text-primary)" }}
        />
        <Search className="shrink-0 h-[17px] w-[17px] text-cr-text-3" strokeWidth={1.6} />
      </label>

      {/* Theme toggle */}
      <div
        className="flex items-center gap-1 h-12 px-[5px]"
        style={{
          background: "var(--topbar-control-bg)",
          border: "1px solid var(--topbar-control-border)",
          borderRadius: "99px",
        }}
      >
        <button
          className="w-[38px] h-[38px] rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer hover:bg-cr-blue-200 transition-colors"
          onClick={() => setTheme("dark")}
          aria-label="Dark mode"
          style={theme === "dark" ? { background: "var(--card-bg)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" } : {}}
        >
          <Moon className="h-[17px] w-[17px] text-cr-text-3" strokeWidth={1.5} />
        </button>
        <button
          className="w-[38px] h-[38px] rounded-full border-none flex items-center justify-center cursor-pointer transition-colors"
          onClick={() => setTheme("light")}
          aria-label="Light mode"
          style={theme === "light" ? { background: "#fff", boxShadow: "0 1px 3px rgba(11,11,15,.1)" } : {}}
        >
          <Sun className="h-[17px] w-[17px]" style={{ color: "var(--text-primary)" }} strokeWidth={1.5} />
        </button>
      </div>

      {/* Notification + Settings + Avatar */}
      <div
        className="flex items-center gap-1 h-12 px-[5px]"
        style={{
          background: "var(--topbar-control-bg)",
          border: "1px solid var(--topbar-control-border)",
          borderRadius: "99px",
        }}
      >
        {/* Bell — opens real notification panel */}
        <div className="relative">
          <button
            className="relative w-[38px] h-[38px] rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer hover:bg-cr-blue-200 transition-colors"
            aria-label="Notifications"
            onClick={() => setShowNotifications((v) => !v)}
          >
            <Bell className="h-[17px] w-[17px]" style={{ color: "var(--text-primary)" }} strokeWidth={1.5} />
          </button>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Settings */}
        <button
          className="w-[38px] h-[38px] rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer hover:bg-cr-blue-200 transition-colors"
          aria-label="Settings"
          onClick={() => router.push("/settings")}
        >
          <Settings className="h-[17px] w-[17px]" style={{ color: "var(--text-primary)" }} strokeWidth={1.5} />
        </button>

        {/* Avatar */}
        <div
          className="w-[38px] h-[38px] rounded-full bg-cr-blue-600 flex items-center justify-center text-[13px] font-bold text-cr-black select-none"
          title={session?.user?.name ?? "User"}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
