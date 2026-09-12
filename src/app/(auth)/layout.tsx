import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center px-6">
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
        </div>
      </header>

      {/* Centered content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-[380px] bg-white p-8"
          style={{ borderRadius: "26px", boxShadow: "0 2px 4px rgba(11,11,15,.04), 0 20px 50px -20px rgba(11,11,15,.2)" }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
