import Link from "next/link"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ConnectedAccountSummary } from "@/types"
import { formatDistanceToNow } from "date-fns"

const PROVIDER_META: Record<
  string,
  { label: string; logo: string; color: string }
> = {
  STRIPE: {
    label: "Stripe",
    logo: "S",
    color: "bg-violet-100 text-violet-700",
  },
  KIT: {
    label: "Kit",
    logo: "K",
    color: "bg-orange-100 text-orange-700",
  },
  MANYCHAT: {
    label: "ManyChat",
    logo: "M",
    color: "bg-sky-100 text-sky-700",
  },
  CALENDLY: {
    label: "Calendly",
    logo: "C",
    color: "bg-teal-100 text-teal-700",
  },
}

function StatusIcon({ status }: { status: string }) {
  if (status === "ACTIVE") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  if (status === "ERROR") return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
  return <XCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
}

interface ConnectedSourcesProps {
  accounts: ConnectedAccountSummary[]
}

export function ConnectedSources({ accounts }: ConnectedSourcesProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle>Connected Sources</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/integrations" className="text-xs text-muted-foreground">
            Manage
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-1">
          {accounts.map((account) => {
            const meta = PROVIDER_META[account.provider] ?? {
              label: account.label,
              logo: account.label[0],
              color: "bg-surface-subtle text-muted-foreground",
            }
            const isConnected = account.status === "ACTIVE"

            return (
              <div
                key={account.provider}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-surface-subtle/60 transition-colors"
              >
                {/* Logo circle */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${meta.color}`}
                >
                  {meta.logo}
                </div>

                {/* Name + status */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xs font-medium text-brand-navy">
                    {meta.label}
                  </span>
                  {isConnected && account.lastSyncedAt ? (
                    <span className="text-[10px] text-muted-foreground">
                      Synced{" "}
                      {formatDistanceToNow(new Date(account.lastSyncedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      {isConnected ? "Connected" : "Not connected"}
                    </span>
                  )}
                </div>

                {/* Status badge + optional sync button */}
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Badge variant="success" className="text-[10px]">
                      Active
                    </Badge>
                  ) : account.status === "ERROR" ? (
                    <Badge variant="warning" className="text-[10px]">
                      Error
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      —
                    </Badge>
                  )}
                  <StatusIcon status={account.status} />
                </div>
              </div>
            )
          })}
        </div>

        {accounts.every((a) => a.status !== "ACTIVE") && (
          <div className="mt-3 rounded-lg border border-dashed border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">
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
