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
    return NextResponse.redirect(new URL("/integrations?error=stripe_denied", req.url))
  }

  try {
    const res = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_secret: process.env.STRIPE_SECRET_KEY ?? "",
      }),
    })

    const data = (await res.json()) as {
      access_token?: string
      refresh_token?: string
      stripe_user_id?: string
      error?: string
    }

    if (!res.ok || data.error || !data.access_token) {
      return NextResponse.redirect(new URL("/integrations?error=stripe_token", req.url))
    }

    const encryptedToken = await encrypt(data.access_token)

    await prisma.connectedAccount.upsert({
      where: { userId_provider: { userId: session.user.id, provider: "STRIPE" } },
      create: {
        userId: session.user.id,
        provider: "STRIPE",
        accessToken: encryptedToken,
        status: "ACTIVE",
      },
      update: { accessToken: encryptedToken, status: "ACTIVE" },
    })

    return NextResponse.redirect(new URL("/integrations?success=stripe", req.url))
  } catch {
    return NextResponse.redirect(new URL("/integrations?error=stripe_failed", req.url))
  }
}
