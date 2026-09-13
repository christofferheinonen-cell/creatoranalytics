"use client"

import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts"
import type { GA4Summary } from "@/types"

interface Props {
  data: GA4Summary | null
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function StatPill({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <div className="flex flex-col gap-[3px]">
      <span className="text-[11px] text-cr-text-3">{label}</span>
      <div className="flex items-baseline gap-[6px]">
        <span className="text-[22px] font-bold tracking-[-0.03em] text-cr-black leading-none">{value}</span>
        {trend !== undefined && (
          <span
            className="text-[11px] font-semibold rounded-full px-[7px] py-[2px]"
            style={{
              background: trend >= 0 ? "#dcfce7" : "#fee2e2",
              color: trend >= 0 ? "#15803d" : "#b91c1c",
            }}
          >
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
    </div>
  )
}

export function TrafficCard({ data }: Props) {
  if (!data) {
    return (
      <div
        className="flex flex-col"
        style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px 20px 22px" }}
      >
        <div className="text-[17px] font-bold tracking-[-0.02em] text-cr-black">Website Traffic</div>
        <p className="text-[13px] text-cr-text-3 mt-[6px]">
          Connect Google Analytics 4 to see traffic data.
        </p>
        <a
          href="/integrations"
          className="mt-3 inline-flex items-center gap-[6px] text-[13px] font-semibold text-cr-black rounded-full px-4 py-[9px] w-fit transition-colors hover:opacity-80"
          style={{ background: "#edf2fb" }}
        >
          Connect GA4
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 14 14 6M7 6h7v7" />
          </svg>
        </a>
      </div>
    )
  }

  const sessionsTrend = pctChange(data.sessions, data.previousSessions)
  const usersTrend = pctChange(data.users, data.previousUsers)

  return (
    <div
      className="flex flex-col gap-[14px]"
      style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px 20px 22px" }}
    >
      <div>
        <div className="text-[17px] font-bold tracking-[-0.02em] text-cr-black">Website Traffic</div>
        <div className="text-[12.5px] text-cr-text-3 mt-[3px]">Last 28 days vs prior period</div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-[10px]">
        <StatPill
          label="Sessions"
          value={data.sessions.toLocaleString()}
          trend={sessionsTrend}
        />
        <StatPill
          label="Users"
          value={data.users.toLocaleString()}
          trend={usersTrend}
        />
        <StatPill
          label="Page Views"
          value={data.pageViews.toLocaleString()}
        />
        <StatPill
          label="Engagement"
          value={`${Math.round(data.engagementRate)}%`}
        />
      </div>

      {/* Sparkline */}
      {data.weeklyData.length > 1 && (
        <div style={{ height: "56px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="ga4Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#abc4ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#abc4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#abc4ff"
                strokeWidth={2}
                fill="url(#ga4Grad)"
                dot={false}
              />
              <Tooltip
                contentStyle={{ display: "none" }}
                cursor={{ stroke: "#abc4ff", strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top sources */}
      {data.sources.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-cr-text-3 mb-[8px] uppercase tracking-[0.06em]">Top sources</div>
          <div className="flex flex-col gap-[6px]">
            {data.sources.slice(0, 4).map((s) => (
              <div key={s.source} className="flex items-center gap-[8px]">
                <span className="text-[12px] text-cr-black flex-1 truncate">{s.source}</span>
                <div className="flex-1" style={{ height: "4px", background: "#f0f4ff", borderRadius: "99px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${s.pct}%`,
                      height: "100%",
                      background: "#abc4ff",
                      borderRadius: "99px",
                    }}
                  />
                </div>
                <span className="text-[11px] text-cr-text-3 w-[32px] text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
