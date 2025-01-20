import NextAuth, { NextAuthOptions, Session } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

import GoogleProvider from "next-auth/providers/google"
import { googleClientId, googleClientSecret, SCOPE } from "@/lib/googleApi"
import { Account } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    error?: "RefreshTokenError"
  }
}

type Token = {
  access_token: string
  expires_in: number
  id_token: string
  refresh_token?: string
  scope: string
  token_type: string
}

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
    async session({ session, user }): Promise<Session> {
      const googleAccount = await prisma.account.findFirst({
        where: { userId: user.id, provider: "google" },
      })
      if (!googleAccount) return session

      if (!googleAccount.expires_at) throw new Error("Missing expires_at")
      if (!googleAccount.refresh_token) throw new Error("Missing refresh_token")

      if (googleAccount.expires_at * 1000 < Date.now()) {
        try {
          // Ref: https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: googleClientId,
              client_secret: googleClientSecret,
              grant_type: "refresh_token",
              refresh_token: googleAccount.refresh_token,
            }),
          })

          const tokensOrError = await response.json()
          if (!response.ok) throw tokensOrError

          const newTokens = tokensOrError as Token
          await updateRefreshToken(googleAccount, newTokens)
        } catch (error) {
          console.error("Error refreshing access_token", error)
          session.error = "RefreshTokenError"
        }
      }

      return {
        user,
        expires: session.expires,
      }
    },
  },
}

const updateRefreshToken = async (account: Account, newTokens: Token): Promise<void> => {
  await prisma.account.update({
    data: {
      access_token: newTokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
      refresh_token: newTokens.refresh_token ?? account.refresh_token,
    },
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: account.providerAccountId,
      },
    },
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
