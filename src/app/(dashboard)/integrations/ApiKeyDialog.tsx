"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Props {
  provider: "KIT" | "MANYCHAT"
  label: string
  docsUrl: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ApiKeyDialog({ provider, label, docsUrl, open, onOpenChange, onSuccess }: Props) {
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? "Failed to save key.")
        return
      }
      setApiKey("")
      onSuccess()
      onOpenChange(false)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Connect {label}</DialogTitle>
          <DialogDescription>
            Paste your API key from{" "}
            <a href={docsUrl} target="_blank" rel="noreferrer" className="underline">
              {label} settings
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apikey">API Key</Label>
            <Input
              id="apikey"
              type="password"
              placeholder="Paste key here"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading || !apiKey.trim()}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save & connect
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
