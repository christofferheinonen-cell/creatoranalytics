"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { BarChart2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface RevenueDataPoint {
  week: string
  revenue: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2"
      style={{
        border: "1px solid #edf2fb",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(11,11,15,.08)",
      }}
    >
      <p className="text-[12px] text-cr-text-3">{label}</p>
      <p className="text-[13px] font-semibold text-cr-black">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
  stripeConnected?: boolean
}

export function RevenueChart({ data, stripeConnected = false }: RevenueChartProps) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0)
  const hasData = data.length > 0

  const weekLabels = ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"]

  return (
    <section
      className="flex flex-col"
      style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[17px] font-bold tracking-[-0.025em] text-cr-black m-0">
            Revenue over time
          </h2>
          <p className="text-[13.5px] text-cr-text-3 mt-[5px] mb-0">
            Last 12 weeks, gross volume.
          </p>
        </div>
        {stripeConnected && (
          <div
            className="flex items-center gap-2 text-[12.5px] font-semibold text-cr-text-2 rounded-full px-[13px] py-[7px]"
            style={{ background: "#f7f9fe", border: "1px solid #edf2fb" }}
          >
            <span className="w-2 h-2 rounded-full bg-cr-blue-600" />
            Stripe connected
          </div>
        )}
      </div>

      {/* Chart area */}
      <div className="relative mt-[18px]" style={{ height: "196px" }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0,1,2,3].map((i) => (
            <div key={i} style={{ borderTop: "1px dashed #edf2fb" }} />
          ))}
          <div style={{ borderTop: "1px solid #e6ecf8" }} />
        </div>

        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#abc4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#abc4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11.5, fill: "#9aa2b1" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11.5, fill: "#9aa2b1" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#edf2fb" }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#abc4ff"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#abc4ff", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-[11px] text-center max-w-[360px]">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: "#edf2fb" }}
              >
                <BarChart2 className="h-5 w-5 text-cr-black" strokeWidth={1.5} />
              </div>
              <div className="text-[15px] font-bold tracking-[-0.02em] text-cr-black">
                No payments in this period
              </div>
              <div className="text-[13.5px] text-cr-text-3 leading-[1.55]">
                {stripeConnected
                  ? "Stripe is syncing normally. Charges show up here within minutes of the first sale."
                  : "Connect Stripe to see your revenue data here."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* X-axis labels when no data */}
      {!hasData && (
        <div className="flex justify-between pt-3">
          {weekLabels.map((w) => (
            <span key={w} className="text-[11.5px] text-cr-text-4">{w}</span>
          ))}
        </div>
      )}
    </section>
  )
}
