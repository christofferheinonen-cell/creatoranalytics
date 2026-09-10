import type { Metadata } from "next"
import { TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      {/* Minimal header */}
      <header className="flex h-14 items-center px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-indigo-500 to-brand-teal-500">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-brand-navy">
            Creator<span className="text-brand-indigo-500">Analytics</span>
          </span>
        </div>
      </header>

      {/* Centered content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px]">{children}</div>
      </main>
    </div>
  )
}
