import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/signup",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.toLowerCase()
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user?.passwordHash) return null

          const valid = await bcrypt.compare(password, user.passwordHash)
          if (!valid) return null

          return { id: user.id, email: user.email, name: user.name }
        } catch {
          // DB errors surface as null (wrong credentials), not as a thrown
          // exception — this prevents NextAuth from showing "Configuration" error
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
