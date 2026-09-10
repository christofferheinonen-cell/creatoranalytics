"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ClearDataButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleClear() {
    if (!confirm("This will permanently delete ALL contacts and funnel events for your account. Continue?")) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch("/api/admin/clear-data", { method: "POST" })
      const data = (await res.json()) as { ok?: boolean; deletedEvents?: number; deletedContacts?: number; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Failed to clear data.")
        return
      }
      setResult(`Deleted ${data.deletedEvents} events and ${data.deletedContacts} contacts.`)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleClear}
        disabled={loading}
        className="w-fit"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Clear all contacts & events
      </Button>
      {result && (
        <p className="text-xs text-green-700">{result} Refresh the page to confirm.</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
