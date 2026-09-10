"use server"

import bcrypt from "bcryptjs"
import { encode } from "next-auth/jwt"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export interface LoginState {
  error: string | null
}

const COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token"

async function createSession(userId: string, email: string, name: string | null) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error(`AUTH_SECRET is not set (checked AUTH_SECRET and NEXTAUTH_SECRET)`)

  const token = await encode({
    token: { sub: userId, id: userId, email, name },
    secret,
    salt: COOKIE,
    maxAge: 30 * 24 * 60 * 60,
  })

  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  })
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase()
  const password = formData.get("password") as string | null

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  let userId: string
  let name: string | null

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user?.passwordHash) return { error: "Invalid email or password." }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return { error: "Invalid email or password." }

    userId = user.id
    name = user.name
    await createSession(userId, email, name)
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }

  redirect("/")
}
