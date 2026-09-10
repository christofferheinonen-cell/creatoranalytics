import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isPublic =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/signup" ||
    nextUrl.pathname.startsWith("/api/auth")

  // Redirect unauthenticated users to login
  if (!isPublic && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
