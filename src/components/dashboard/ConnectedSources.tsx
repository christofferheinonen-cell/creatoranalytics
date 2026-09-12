import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { ConnectedAccountSummary } from "@/types"

interface SourceShare {
  provider: string
  pct: number
}

interface TopSourcesProps {
  accounts: ConnectedAccountSummary[]
  sourceShares?: SourceShare[]
}

const PROVIDER_META: Record<string, { label: string; logo: string }> = {
  STRIPE: { label: "Stripe", logo: "S" },
  KIT: { label: "Kit", logo: "K" },
  MANYCHAT: { label: "ManyChat", logo: "M" },
  CALENDLY: { label: "Calendly", logo: "C" },
}

export function ConnectedSources({ accounts, sourceShares = [] }: TopSourcesProps) {
  const connectedAccounts = accounts.filter((a) => a.status === "ACTIVE")

  // Build share bar segments
  const totalShare = sourceShares.reduce((s, x) => s + x.pct, 0)
  const barColors = ["#0b0b0f", "#abc4ff", "#dde4f2", "#e6ecf8"]

  return (
    <div
      className="flex flex-col"
      style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[16px] font-bold tracking-[-0.02em] text-cr-black m-0">
            Top sources
          </h3>
          <p className="text-[13px] text-cr-text-3 mt-[5px] mb-0">
            Where your contacts come from
          </p>
        </div>
        <Link
          href="/integrations"
          className="text-[12.5px] font-semibold text-cr-text-3 hover:text-cr-black transition-colors"
        >
          Manage
        </Link>
      </div>

      {/* Share bar */}
      {sourceShares.length > 0 && (
        <div className="flex gap-1 mt-4 mb-1">
          {sourceShares.map((s, i) => (
            <div
              key={s.provider}
              style={{
                flex: s.pct,
                height: "8px",
                borderRadius: "99px",
                background: barColors[i % barColors.length],
              }}
            />
          ))}
        </div>
      )}

      {/* Source list */}
      <div className="flex flex-col">
        {accounts.map((account, i) => {
          const meta = PROVIDER_META[account.provider] ?? {
            label: account.label,
            logo: account.label[0],
          }
          const isConnected = account.status === "ACTIVE"
          const share = sourceShares.find((s) => s.provider === account.provider)

          return (
            <div
              key={account.provider}
              className="flex items-center gap-[11px]"
              style={{
                padding: i === 0 && sourceShares.length > 0 ? "13px 0" : "13px 0",
                borderTop: "1px solid #f2f5fb",
                marginTop: i === 0 ? "12px" : undefined,
              }}
            >
              <div
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                style={{
                  background: isConnected ? "#edf2fb" : "#f5f6f8",
                  color: isConnected ? "#0b0b0f" : "#9aa2b1",
                }}
              >
                {meta.logo}
              </div>
              <div className="min-w-0">
                <div
                  className="text-[14px] font-semibold leading-tight"
                  style={{ color: isConnected ? "#0b0b0f" : "#7b8497" }}
                >
                  {meta.label}
                </div>
                <div className="text-[12px] text-cr-text-4">
                  {isConnected && account.lastSyncedAt
                    ? `Synced ${formatDistanceToNow(new Date(account.lastSyncedAt), { addSuffix: true })}`
                    : "Not connected"}
                </div>
              </div>
              {isConnected && share ? (
                <span
                  className="ml-auto text-[12px] font-semibold rounded-full px-[10px] py-1"
                  style={{ background: "#edf2fb" }}
                >
                  {share.pct}%
                </span>
              ) : !isConnected ? (
                <Link
                  href="/integrations"
                  className="ml-auto text-[12.5px] font-semibold text-cr-black hover:bg-cr-blue-100 transition-colors"
                  style={{
                    border: "1px solid #dfe6f4",
                    borderRadius: "99px",
                    padding: "4px 11px",
                  }}
                >
                  Connect
                </Link>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
