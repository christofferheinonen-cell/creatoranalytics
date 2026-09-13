import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encrypt"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url))

  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(new URL("/integrations?error=ga4_denied", req.url))
  }

  try {
    const redirectUri = `${req.nextUrl.origin}/api/oauth/google-analytics/callback`

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_ANALYTICS_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET ?? "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const data = (await res.json()) as {
      access_token?: string
      refresh_token?: string
      expires_in?: number
      error?: string
    }

    if (!res.ok || data.error || !data.access_token) {
      return NextResponse.redirect(new URL("/integrations?error=ga4_token", req.url))
    }

    const encryptedToken = await encrypt(data.access_token)
    const encryptedRefresh = data.refresh_token ? await encrypt(data.refresh_token) : undefined
    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined

    await prisma.connectedAccount.upsert({
      where: { userId_provider: { userId: session.user.id, provider: "GOOGLE_ANALYTICS" } },
      create: {
        userId: session.user.id,
        provider: "GOOGLE_ANALYTICS",
        accessToken: encryptedToken,
        refreshToken: encryptedRefresh,
        expiresAt,
        status: "ACTIVE",
      },
      update: {
        accessToken: encryptedToken,
        refreshToken: encryptedRefresh,
        expiresAt,
        status: "ACTIVE",
      },
    })

    return NextResponse.redirect(new URL("/integrations?success=ga4", req.url))
  } catch {
    return NextResponse.redirect(new URL("/integrations?error=ga4_failed", req.url))
  }
}
