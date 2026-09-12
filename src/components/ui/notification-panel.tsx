"use client"

import { useEffect, useRef } from "react"
import { Bell } from "lucide-react"

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl overflow-hidden"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "0 8px 32px rgba(11,11,15,0.12)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--card-border)" }}
      >
        <span className="text-[13.5px] font-bold" style={{ color: "var(--text-primary)" }}>
          Notifications
        </span>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <Bell className="h-6 w-6" style={{ color: "var(--text-quaternary)" }} strokeWidth={1.5} />
        <p className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
          No notifications yet
        </p>
        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          Activity from your connected integrations will appear here.
        </p>
      </div>
    </div>
  )
}
