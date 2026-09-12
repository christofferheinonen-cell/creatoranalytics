import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { RevenuePill } from "@/components/dashboard/RevenuePill"
import { formatCurrency } from "@/lib/utils"

export const metadata: Metadata = { title: "Revenue" }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function groupByWeek(events: { value: { toNumber(): number } | null; timestamp: Date }[]) {
  const weeks = new Map<string, number>()
  for (const event of events) {
    const d = new Date(event.timestamp)
    const weekOfMonth = Math.ceil(d.getDate() / 7)
    const key = `${MONTHS[d.getMonth()]} W${weekOfMonth}`
    weeks.set(key, (weeks.get(key) ?? 0) + (event.value?.toNumber() ?? 0))
  }
  return [...weeks.entries()].map(([week, revenue]) => ({ week, revenue }))
}

export default async function RevenuePage() {
  const session = await auth()
  const userId = session!.user.id

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000)

  const [currentRevenue, transactionCount, revenueEvents, stripeAccount] = await Promise.all([
    prisma.funnelEvent.aggregate({
      where: { userId, type: "PURCHASED", timestamp: { gte: thirtyDaysAgo } },
      _sum: { value: true },
    }),
    prisma.funnelEvent.count({
      where: { userId, type: "PURCHASED", timestamp: { gte: thirtyDaysAgo } },
    }),
    prisma.funnelEvent.findMany({
      where: { userId, type: "PURCHASED", timestamp: { gte: twelveWeeksAgo } },
      select: { value: true, timestamp: true },
      orderBy: { timestamp: "asc" },
    }),
    prisma.connectedAccount.findFirst({
      where: { userId, provider: "STRIPE", status: "ACTIVE" },
    }),
  ])

  const totalRevenue = currentRevenue._sum.value?.toNumber() ?? 0
  const chartData = groupByWeek(revenueEvents)
  const stripeConnected = !!stripeAccount

  // Recent transactions
  const recentPurchases = await prisma.funnelEvent.findMany({
    where: { userId, type: "PURCHASED", timestamp: { gte: thirtyDaysAgo } },
    select: { value: true, timestamp: true, source: true, contactId: true },
    orderBy: { timestamp: "desc" },
    take: 20,
  })

  return (
    <div className="flex flex-col gap-5" style={{ padding: "22px" }}>
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.04em] text-cr-black m-0">Revenue</h1>
        <p className="text-[15px] text-cr-text-3 mt-[7px] mb-0">
          Gross revenue from Stripe, last 30 days.
        </p>
      </div>

      <RevenuePill totalRevenue={totalRevenue} transactionCount={transactionCount} />
      <RevenueChart data={chartData} stripeConnected={stripeConnected} />

      {recentPurchases.length > 0 && (
        <section style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px" }}>
          <h2 className="text-[17px] font-bold tracking-[-0.025em] text-cr-black m-0 mb-[16px]">
            Recent transactions
          </h2>
          <div className="flex flex-col">
            {recentPurchases.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3"
                style={{ borderTop: i > 0 ? "1px solid #f2f5fb" : "none" }}
              >
                <div>
                  <div className="text-[14px] font-semibold text-cr-black">
                    {p.source.charAt(0).toUpperCase() + p.source.slice(1).toLowerCase()} purchase
                  </div>
                  <div className="text-[12px] text-cr-text-4">
                    {new Date(p.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-[15px] font-bold text-cr-black">
                  {p.value ? formatCurrency(p.value.toNumber()) : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
