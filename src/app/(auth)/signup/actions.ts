"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export interface SignupState {
  error: string | null
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

  try {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (existing) {
      return { error: "An account with that email already exists." }
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
    })
  } catch {
    return { error: "Something went wrong. Please try again." }
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" })
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created but sign-in failed. Please log in manually." }
    }
    throw err
  }

  return { error: null }
}
