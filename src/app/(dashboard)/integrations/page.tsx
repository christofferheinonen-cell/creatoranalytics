import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { IntegrationCard } from "./IntegrationCard"
import { ClearDataButton } from "./ClearDataButton"

export const metadata: Metadata = { title: "Integrations" }

const ERROR_MESSAGES: Record<string, string> = {
  stripe_not_configured: "Stripe is not configured yet. Add STRIPE_CLIENT_ID and STRIPE_SECRET_KEY in environment variables.",
  calendly_not_configured: "Calendly is not configured yet. Add CALENDLY_CLIENT_ID and CALENDLY_CLIENT_SECRET in environment variables.",
  stripe_denied: "Stripe connection was denied or cancelled.",
  stripe_token: "Failed to exchange Stripe token. Check your STRIPE_SECRET_KEY.",
  stripe_failed: "Stripe connection failed. Please try again.",
  calendly_denied: "Calendly connection was denied or cancelled.",
  calendly_token: "Failed to exchange Calendly token. Check your credentials.",
  calendly_failed: "Calendly connection failed. Please try again.",
}

const SUCCESS_MESSAGES: Record<string, string> = {
  stripe: "Stripe connected successfully.",
  calendly: "Calendly connected successfully.",
}

const INTEGRATIONS = [
  {
    provider: "STRIPE" as const,
    label: "Stripe",
    description: "Sync charges, customers, and refunds to track purchase events.",
    authType: "apikey" as const,
    docsUrl: "https://stripe.com/docs/keys",
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

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const session = await auth()
  const userId = session!.user.id
  const { error, success } = await searchParams

  const connectedAccounts = await prisma.connectedAccount.findMany({
    where: { userId, status: "ACTIVE" },
    select: { provider: true, lastSyncedAt: true, id: true },
  })

  const syncLogs = await prisma.syncLog.findMany({
    where: { connectedAccount: { userId } },
    orderBy: { startedAt: "desc" },
    take: 10,
    select: {
      id: true,
      status: true,
      startedAt: true,
      completedAt: true,
      eventsIngested: true,
      errors: true,
      connectedAccountId: true,
    },
  })

  const accountMap = new Map(connectedAccounts.map((a) => [a.provider, a]))

  return (
    <div className="flex flex-col gap-5" style={{ padding: "22px" }}>
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.04em] text-cr-black m-0">Integrations</h1>
        <p className="text-[15px] text-cr-text-3 mt-[7px] mb-0">
          Connect your platforms to start pulling funnel data.
        </p>
      </div>

      {/* Status banners */}
      {error && (
        <div
          className="px-4 py-3 text-[13px] text-red-700"
          style={{ border: "1px solid #fecaca", background: "#fef2f2", borderRadius: "16px" }}
        >
          {ERROR_MESSAGES[error] ?? "Something went wrong. Please try again."}
        </div>
      )}
      {success && SUCCESS_MESSAGES[success] && (
        <div
          className="px-4 py-3 text-[13px] text-green-700"
          style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", borderRadius: "16px" }}
        >
          {SUCCESS_MESSAGES[success]}
        </div>
      )}

      {/* Integration cards */}
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

      {/* Sync history */}
      <section style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px" }}>
        <h3 className="text-[16px] font-bold tracking-[-0.02em] text-cr-black m-0 mb-[5px]">
          Sync History
        </h3>
        <p className="text-[13px] text-cr-text-3 mb-[16px]">Recent sync runs — status, events ingested, and errors.</p>
        {syncLogs.length === 0 ? (
          <p className="text-[13.5px] text-cr-text-3 py-4 text-center">
            No sync runs yet. Connect an integration to see history here.
          </p>
        ) : (
          <div className="flex flex-col">
            {syncLogs.map((log, i) => {
              const providerKey = [...accountMap.entries()].find(([, a]) => a.id === log.connectedAccountId)?.[0]
              const errorMsg = log.errors
                ? typeof log.errors === "string" ? log.errors : JSON.stringify(log.errors)
                : null
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 text-[12px]"
                  style={{ borderTop: i > 0 ? "1px solid #f2f5fb" : "none" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-2 w-2 rounded-full shrink-0"
                      style={{
                        background:
                          log.status === "SUCCESS" ? "#22c55e"
                            : log.status === "RUNNING" ? "#eab308"
                            : "#ef4444",
                      }}
                    />
                    <span className="font-semibold text-cr-black">
                      {providerKey ?? log.connectedAccountId}
                    </span>
                    <span className="text-cr-text-3">{log.eventsIngested ?? 0} events</span>
                    {errorMsg && (
                      <span className="truncate max-w-[200px] text-red-600">{errorMsg}</span>
                    )}
                  </div>
                  <span className="text-cr-text-4">
                    {new Date(log.startedAt).toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section
        style={{ border: "1px solid #fecaca", borderRadius: "26px", padding: "20px" }}
      >
        <h3 className="text-[16px] font-bold text-red-700 m-0 mb-[5px]">Danger Zone</h3>
        <p className="text-[13px] text-cr-text-3 mb-[16px]">
          Permanently delete all contacts and funnel events from your account.
          Use this to wipe test or seeded data before going live.
        </p>
        <ClearDataButton />
      </section>
    </div>
  )
}
