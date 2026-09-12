"use client"

import { Bell, Settings, Search, Sun, Moon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

export function TopBar() {
  const { data: session } = useSession()
  const [darkMode, setDarkMode] = useState(false)

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "U"

  return (
    <header
      className="flex items-center gap-3 flex-wrap"
      style={{ padding: "18px 22px", borderBottom: "none" }}
    >
      {/* Search */}
      <label
        className="flex items-center gap-[10px] flex-1 min-w-0 h-12 px-5 cursor-text"
        style={{
          background: "#f7f9fe",
          border: "1px solid #edf2fb",
          borderRadius: "99px",
          minWidth: "260px",
        }}
      >
        <input
          type="text"
          placeholder="Search contacts, funnels or payments"
          className="border-none outline-none bg-transparent font-[inherit] text-[14px] text-cr-black w-full min-w-0 placeholder:text-cr-text-4"
        />
        <Search className="shrink-0 h-[17px] w-[17px] text-cr-text-3" strokeWidth={1.6} />
      </label>

      {/* Theme toggle */}
      <div
        className="flex items-center gap-1 h-12 px-[5px]"
        style={{
          background: "#f7f9fe",
          border: "1px solid #edf2fb",
          borderRadius: "99px",
        }}
      >
        <button
          className="w-[38px] h-[38px] rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer hover:bg-cr-blue-200 transition-colors"
          onClick={() => setDarkMode(true)}
          aria-label="Dark mode"
        >
          <Moon className="h-[17px] w-[17px] text-cr-text-3" strokeWidth={1.5} />
        </button>
        <button
          className="w-[38px] h-[38px] rounded-full border-none flex items-center justify-center cursor-pointer transition-colors"
          style={{
            background: darkMode ? "transparent" : "#fff",
            boxShadow: darkMode ? "none" : "0 1px 3px rgba(11,11,15,.1)",
          }}
          onClick={() => setDarkMode(false)}
          aria-label="Light mode"
        >
          <Sun className="h-[17px] w-[17px] text-cr-black" strokeWidth={1.5} />
        </button>
      </div>

      {/* Notification + Settings + Avatar */}
      <div
        className="flex items-center gap-1 h-12 px-[5px]"
        style={{
          background: "#f7f9fe",
          border: "1px solid #edf2fb",
          borderRadius: "99px",
        }}
      >
        <button
          className="relative w-[38px] h-[38px] rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer hover:bg-cr-blue-200 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-[17px] w-[17px] text-cr-black" strokeWidth={1.5} />
          <span
            className="absolute top-1 right-1 min-w-[15px] h-[15px] px-[3px] rounded-full bg-cr-black text-white text-[9.5px] font-bold flex items-center justify-center"
            style={{ border: "2px solid #f7f9fe" }}
          >
            1
          </span>
        </button>
        <button
          className="w-[38px] h-[38px] rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer hover:bg-cr-blue-200 transition-colors"
          aria-label="Settings"
          onClick={() => window.location.href = "/settings"}
        >
          <Settings className="h-[17px] w-[17px] text-cr-black" strokeWidth={1.5} />
        </button>
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
