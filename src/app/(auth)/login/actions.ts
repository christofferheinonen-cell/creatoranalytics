"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/auth"

export interface LoginState {
  error: string | null
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

  try {
    // signIn throws a NEXT_REDIRECT on success — must re-throw it
    await signIn("credentials", { email, password, redirectTo: "/" })
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return { error: "Invalid email or password." }
      }
      return { error: "Something went wrong. Please try again." }
    }
    // Re-throw the redirect (not an auth error — it's the success path)
    throw err
  }

  return { error: null }
}
