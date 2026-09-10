import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url))

  const clientId = process.env.STRIPE_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/integrations?error=stripe_not_configured", req.url)
    )
  }

  const redirectUri = `${req.nextUrl.origin}/api/oauth/stripe/callback`
  const url = new URL("https://connect.stripe.com/oauth/authorize")
  url.searchParams.set("response_type", "code")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("scope", "read_write")
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("state", session.user.id)

  return NextResponse.redirect(url)
}
