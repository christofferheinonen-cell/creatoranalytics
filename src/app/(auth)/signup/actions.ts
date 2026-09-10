"use server"

import bcrypt from "bcryptjs"
import { encode } from "next-auth/jwt"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

export interface SignupState {
  error: string | null
}

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

const COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token"

async function createSession(userId: string, email: string, name: string | null) {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is not set")

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

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = (formData.get("name") as string | null)?.trim()
  const email = (formData.get("email") as string | null)?.trim().toLowerCase()
  const password = formData.get("password") as string | null

  const parsed = RegisterSchema.safeParse({ name, email, password })
  if (!parsed.success) {
    return { error: "Invalid input. Email must be valid and password at least 8 characters." }
  }

  let userId: string

  try {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (existing) {
      return { error: "An account with that email already exists." }
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
    })

    userId = user.id
    await createSession(userId, parsed.data.email, parsed.data.name)
  } catch {
    return { error: "Something went wrong. Please try again." }
  }

  redirect("/")
}
