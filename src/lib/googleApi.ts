import { prisma } from "@/lib/prisma"
import { Account } from "@prisma/client"

const clientId = process.env.GOOGLE_CLIENT_ID!
if (!clientId) throw new Error("Missing GOOGLE_CLIENT_ID env var")

const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
if (!clientSecret) throw new Error("Missing GOOGLE_CLIENT_SECRET env var")

export const SCOPE = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  // "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.app.created",
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
]

export { clientId as googleClientId, clientSecret as googleClientSecret }

type Token = {
  access_token: string
  expires_in: number
  id_token: string
  refresh_token?: string
  scope: string
  token_type: string
}

export const getOrRefreshAccessToken = async (userId: string): Promise<string | null> => {
  const googleAccount = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  })
  if (!googleAccount) throw new Error("Missing google account")

  if (!googleAccount.expires_at) throw new Error("Missing expires_at")
  if (!googleAccount.refresh_token) throw new Error("Missing refresh_token")

  if (googleAccount.expires_at * 1000 < Date.now()) {
    try {
      // Ref: https://accounts.google.com/.well-known/openid-configuration
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: googleAccount.refresh_token,
        }),
      })

      const tokensOrError = await response.json()
      if (!response.ok) throw tokensOrError

      const newTokens = tokensOrError as Token
      await updateRefreshToken(googleAccount, newTokens)
      return newTokens.access_token
    } catch (error) {
      console.error("Error refreshing access_token", error)
      throw new Error("RefreshTokenError")
    }
  } else {
    return googleAccount.access_token
  }
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
