import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url))

  const clientId = process.env.GOOGLE_ANALYTICS_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/integrations?error=ga4_not_configured", req.url)
    )
  }

  const redirectUri = `${req.nextUrl.origin}/api/oauth/google-analytics/callback`
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("scope", "https://www.googleapis.com/auth/analytics.readonly")
  url.searchParams.set("access_type", "offline")
  url.searchParams.set("prompt", "consent")
  url.searchParams.set("state", session.user.id)

  return NextResponse.redirect(url)
}
