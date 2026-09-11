import Link from "next/link"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ConnectedAccountSummary } from "@/types"
import { formatDistanceToNow } from "date-fns"

const PROVIDER_META: Record<
  string,
  { label: string; logo: string; bg: string; text: string }
> = {
  STRIPE: { label: "Stripe", logo: "S", bg: "bg-violet-50", text: "text-violet-600" },
  KIT: { label: "Kit", logo: "K", bg: "bg-orange-50", text: "text-orange-600" },
  MANYCHAT: { label: "ManyChat", logo: "M", bg: "bg-sky-50", text: "text-sky-600" },
  CALENDLY: { label: "Calendly", logo: "C", bg: "bg-teal-50", text: "text-teal-600" },
}

function StatusIcon({ status }: { status: string }) {
  if (status === "ACTIVE")
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  if (status === "ERROR")
    return <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
  return <XCircle className="h-3.5 w-3.5 text-[#CBD5E1]" />
}

interface ConnectedSourcesProps {
  accounts: ConnectedAccountSummary[]
}

export function ConnectedSources({ accounts }: ConnectedSourcesProps) {
  return (
    <Card>
      <div className="flex items-center justify-between px-5 pb-1 pt-5">
        <div>
          <h3 className="text-[13px] font-semibold text-brand-navy">Connected Sources</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">List of active integrations</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/integrations" className="text-[12px] text-muted-foreground">
            Manage
          </Link>
        </Button>
      </div>

      <CardContent className="pt-3">
        <div className="flex flex-col divide-y divide-[#F1F5F9]">
          {accounts.map((account) => {
            const meta = PROVIDER_META[account.provider] ?? {
              label: account.label,
              logo: account.label[0],
              bg: "bg-[#F1F5F9]",
              text: "text-muted-foreground",
            }
            const isConnected = account.status === "ACTIVE"

            return (
              <div
                key={account.provider}
                className="flex items-center gap-3 py-2.5"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${meta.bg} ${meta.text}`}
                >
                  {meta.logo}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[12px] font-medium text-brand-navy">
                    {meta.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {isConnected && account.lastSyncedAt
                      ? `Synced ${formatDistanceToNow(new Date(account.lastSyncedAt), { addSuffix: true })}`
                      : isConnected
                      ? "Connected"
                      : "Not connected"}
                  </span>
                </div>

                <StatusIcon status={account.status} />
              </div>
            )
          })}
        </div>

        {accounts.every((a) => a.status !== "ACTIVE") && (
          <div className="mt-3 rounded-lg border border-dashed border-[#E2E8F0] p-3 text-center">
            <p className="text-[12px] text-muted-foreground">
              No integrations connected yet.{" "}
              <Link
                href="/integrations"
                className="font-medium text-brand-indigo-500 hover:underline"
              >
                Connect your first →
              </Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
