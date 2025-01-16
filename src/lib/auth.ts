import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

import GoogleProvider from "next-auth/providers/google"
import { googleClientId, googleClientSecret, SCOPE } from "@/lib/googleApi"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          scope: SCOPE.join(" "),
          // Refresh token を取得するため
          // https://next-auth.js.org/providers/google
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
