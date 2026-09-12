import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const firstName = session.user?.name?.split(" ")[0] ?? "there"

  return (
    <div className="flex min-h-screen items-stretch p-[22px]">
      <div
        className="flex w-full max-w-[1640px] mx-auto bg-white overflow-hidden"
        style={{
          borderRadius: "30px",
          boxShadow: "0 2px 4px rgba(11,11,15,.04), 0 30px 70px -30px rgba(11,11,15,.28)",
        }}
      >
        <Sidebar />
        <div className="flex flex-1 flex-col bg-white min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
