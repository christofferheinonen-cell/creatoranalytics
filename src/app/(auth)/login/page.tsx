"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "./actions"

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, { error: null })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-brand-navy">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your CreatorAnalytics account
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {state.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-brand-indigo-500 hover:underline"
        >
          Sign up free
        </Link>
      </p>
    </div>
  )
}
