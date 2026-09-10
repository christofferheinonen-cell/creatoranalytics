import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { IntegrationCard } from "./IntegrationCard"

export const metadata: Metadata = { title: "Integrations" }

const INTEGRATIONS = [
  {
    provider: "STRIPE" as const,
    label: "Stripe",
    description: "Sync charges, customers, and refunds to track purchase events.",
    authType: "oauth" as const,
    docsUrl: "https://stripe.com/docs/connect",
    color: "bg-violet-100 text-violet-700",
    logo: "S",
  },
  {
    provider: "KIT" as const,
    label: "Kit (ConvertKit)",
    description: "Sync email subscribers and unsubscribes.",
    authType: "apikey" as const,
    docsUrl: "https://developers.kit.com",
    color: "bg-orange-100 text-orange-700",
    logo: "K",
  },
  {
    provider: "MANYCHAT" as const,
    label: "ManyChat",
    description: "Sync DM bot subscribers and freebie claim events.",
    authType: "apikey" as const,
    docsUrl: "https://api.manychat.com/swagger",
    color: "bg-sky-100 text-sky-700",
    logo: "M",
  },
  {
    provider: "CALENDLY" as const,
    label: "Calendly",
    description: "Sync call bookings, completions, and no-shows.",
    authType: "oauth" as const,
    docsUrl: "https://developer.calendly.com",
    color: "bg-teal-100 text-teal-700",
    logo: "C",
  },
]

export default async function IntegrationsPage() {
  const session = await auth()
  const userId = session!.user.id

  const connectedAccounts = await prisma.connectedAccount.findMany({
    where: { userId, status: "ACTIVE" },
    select: { provider: true, lastSyncedAt: true, id: true },
  })

  const syncLogs = await prisma.syncLog.findMany({
    where: {
      connectedAccount: { userId },
    },
    orderBy: { startedAt: "desc" },
    take: 10,
    select: {
      id: true,
      status: true,
      startedAt: true,
      finishedAt: true,
      eventsIngested: true,
      error: true,
      connectedAccount: { select: { provider: true } },
    },
  })

  const accountMap = new Map(connectedAccounts.map((a) => [a.provider, a]))

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-brand-navy">Integrations</h2>
        <p className="text-xs text-muted-foreground">
          Connect your platforms to start pulling funnel data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((integration) => {
          const account = accountMap.get(integration.provider)
          return (
            <IntegrationCard
              key={integration.provider}
              {...integration}
              isConnected={!!account}
              lastSyncedAt={account?.lastSyncedAt?.toISOString() ?? null}
              connectedAccountId={account?.id ?? null}
            />
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>Recent sync runs — status, events ingested, and errors.</CardDescription>
        </CardHeader>
        <CardContent>
          {syncLogs.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-muted-foreground">
                No sync runs yet. Connect an integration and run a sync to see history here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        log.status === "SUCCESS"
                          ? "bg-green-500"
                          : log.status === "RUNNING"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="font-medium text-brand-navy">
                      {log.connectedAccount.provider}
                    </span>
                    <span className="text-muted-foreground">
                      {log.eventsIngested ?? 0} events
                    </span>
                    {log.error && (
                      <span className="truncate max-w-[200px] text-red-600">{log.error}</span>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(log.startedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
