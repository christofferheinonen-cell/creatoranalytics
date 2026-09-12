"use client"

import { useState } from "react"
import { ExternalLink, RefreshCw, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ApiKeyDialog } from "./ApiKeyDialog"

interface Props {
  provider: "STRIPE" | "KIT" | "MANYCHAT" | "CALENDLY"
  label: string
  description: string
  authType: "oauth" | "apikey"
  color: string
  logo: string
  docsUrl: string
  isConnected: boolean
  lastSyncedAt: string | null
  connectedAccountId: string | null
}

export function IntegrationCard({
  provider,
  label,
  description,
  authType,
  color,
  logo,
  docsUrl,
  isConnected,
  lastSyncedAt,
  connectedAccountId,
}: Props) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  async function handleSync() {
    if (!connectedAccountId) return
    setSyncing(true)
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectedAccountId }),
      })
      router.refresh()
    } finally {
      setSyncing(false)
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      })
      router.refresh()
    } finally {
      setDisconnecting(false)
    }
  }

  function handleConnect() {
    if (authType === "apikey") {
      setDialogOpen(true)
    } else {
      // OAuth: redirect to our server-side OAuth initiation route
      const providerSlug = provider.toLowerCase()
      window.location.href = `/api/oauth/${providerSlug}`
    }
  }

  return (
    <>
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
            {isConnected && lastSyncedAt && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Last synced: {new Date(lastSyncedAt).toLocaleString()}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pt-0">
          <div className="rounded-lg border border-cr-blue-100 bg-cr-blue-50 px-3 py-2">
            <p className="text-[11px] text-cr-text-3">
              <span className="font-medium text-cr-black">Auth: </span>
              {authType === "oauth"
                ? "OAuth 2.0 — click Connect to authorize via browser"
                : "API key — paste your key from the platform settings"}
            </p>
          </div>

          {isConnected ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs gap-1.5"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Sync now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:text-destructive"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Disconnect"}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs" onClick={handleConnect}>
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

      {authType === "apikey" && (
        <ApiKeyDialog
          provider={provider as "STRIPE" | "KIT" | "MANYCHAT"}
          label={label}
          docsUrl={docsUrl}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
