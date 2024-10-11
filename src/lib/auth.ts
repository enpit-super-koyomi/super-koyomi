import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

import GoogleProvider from "next-auth/providers/google";

const clientId = process.env.GOOGLE_CLIENT_ID;
if (!clientId) throw new Error("Missing GOOGLE_CLIENT_ID env var");

const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientSecret) throw new Error("Missing GOOGLE_CLIENT_SECRET env var");

/** * @NOTE
 * Google OIDC はユーザの初回ログイン時はリフレッシュトークンを返却しないらしいが
 * まぁテストなので複数階ログインするだろうし許容する
 * https://next-auth.js.org/providers/google
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
    }),
  ],
};
 
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
