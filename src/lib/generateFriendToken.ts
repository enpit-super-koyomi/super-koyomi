"use server"
import { db } from "./prisma"

export async function generateFriendToken(tokenOwner: string) {
  return await db.generateFriendToken(tokenOwner)
}
