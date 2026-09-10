import type { Metadata } from "next"
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "Integrations" }

const INTEGRATIONS = [
  {
    provider: "STRIPE",
    label: "Stripe",
    description: "Sync charges, customers, and refunds to track purchase events.",
    authType: "oauth",
    docsUrl: "https://stripe.com/docs/connect",
    color: "bg-violet-100 text-violet-700",
    logo: "S",
  },
  {
    provider: "KIT",
    label: "Kit (ConvertKit)",
    description: "Sync email subscribers and unsubscribes.",
    authType: "apikey",
    docsUrl: "https://developers.kit.com",
    color: "bg-orange-100 text-orange-700",
    logo: "K",
  },
  {
    provider: "MANYCHAT",
    label: "ManyChat",
    description: "Sync DM bot subscribers and freebie claim events.",
    authType: "apikey",
    docsUrl: "https://api.manychat.com/swagger",
    color: "bg-sky-100 text-sky-700",
    logo: "M",
  },
  {
    provider: "CALENDLY",
    label: "Calendly",
    description: "Sync call bookings, completions, and no-shows.",
    authType: "oauth",
    docsUrl: "https://developer.calendly.com",
    color: "bg-teal-100 text-teal-700",
    logo: "C",
  },
]

function IntegrationCard({
  provider,
  label,
  description,
  authType,
  color,
  logo,
  docsUrl,
}: (typeof INTEGRATIONS)[number]) {
  // TODO: Check DB for connected account status and last sync
  const isConnected = false

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start gap-4 pb-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${color}`}
        >
          {logo}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">{label}</CardTitle>
            {isConnected ? (
              <Badge variant="success" className="text-[10px]">Connected</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">Not connected</Badge>
            )}
          </div>
          <CardDescription className="mt-1 text-xs leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-0">
        {/* Auth type indicator */}
        <div className="rounded-lg border border-border bg-surface-subtle px-3 py-2">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-brand-navy">Auth: </span>
            {authType === "oauth"
              ? "OAuth 2.0 — click Connect to authorize via browser"
              : "API key — paste your key from the platform settings"}
          </p>
        </div>

        {isConnected ? (
          <div className="flex gap-2">
            {/* TODO: wire up to /api/sync with connectedAccountId */}
            <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5">
              <RefreshCw className="h-3 w-3" />
              Sync now
            </Button>
            {/* TODO: wire up to /api/integrations/disconnect */}
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {/* TODO: redirect to OAuth flow or show API key modal */}
            <Button size="sm" className="flex-1 text-xs">
              Connect {label}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground gap-1"
              asChild
            >
              <a href={docsUrl} target="_blank" rel="noreferrer">
                Docs
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-brand-navy">Integrations</h2>
        <p className="text-xs text-muted-foreground">
          Connect your platforms to start pulling funnel data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard key={integration.provider} {...integration} />
        ))}
      </div>

      {/* Sync history placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>
            Recent sync runs — status, events ingested, and errors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <p className="text-xs text-muted-foreground">
              No sync runs yet. Connect an integration and run a sync to see history here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
