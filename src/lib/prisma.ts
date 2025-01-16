import { Account, PrismaClient, User } from "@prisma/client"
import { FRIEND_TOKEN_LENGTH, FRIEND_TOKEN_LIFE_DAYS } from "./const"
import { nanoid } from "nanoid"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const db = {
  findAccount: async (userId: string): Promise<Account | null> => {
    const account = await prisma.account.findFirst({
      where: { userId },
    })
    return account
  },

  allUsers: async (): Promise<User[]> => {
    const users = await prisma.user.findMany()
    return users
  },

  /**
   * Returns friends of the user.
   * @param userId - ID of the user whose friends are listed in the result
   * @returns Array of the friends of the given user
   */
  friendsOf: async (userId: string): Promise<User[]> => {
    const friends = await prisma.friendship.findMany({
      select: { user1: true, user2: true },
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    })

    return friends.map(v => (v.user1.id === userId ? v.user2 : v.user1))
  },

  /**
   * Lets the two users be friends.
   * @param oneUserId - ID of one user
   * @param theOtherUserId - ID of the other user
   * @returns `true` when the friendship is established, or `false` otherwise
   */
  beFriends: async (oneUserId: string, theOtherUserId: string): Promise<boolean> => {
    if (oneUserId === theOtherUserId) return false
    try {
      // The friendship table has constraint: `user1Id` < `user2Id`.
      if (oneUserId.localeCompare(theOtherUserId) < 0) {
        await prisma.friendship.create({ data: { user1Id: oneUserId, user2Id: theOtherUserId } })
      } else {
        await prisma.friendship.create({ data: { user1Id: theOtherUserId, user2Id: oneUserId } })
      }
      return true
    } catch {
      return false
    }
  },

  /**
   * Dissolves the mutual friendship of the two users.
   * @param oneUserId - ID of one user
   * @param theOtherUserId - ID of the other user
   */
  dissolveFriends: async (oneUserId: string, theOtherUserId: string) => {
    if (oneUserId === theOtherUserId) return
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { user1Id: oneUserId, user2Id: theOtherUserId },
          { user1Id: theOtherUserId, user2Id: oneUserId },
        ],
      },
    })
  },

  /**
   * Generates a friend token. It can be used to compose friend invitation URL.
   * @param ownerId - ID of the user who owns the token
   * @returns Friend token
   */
  generateFriendToken: async (ownerId: string) => {
    const token = nanoid(FRIEND_TOKEN_LENGTH)
    await prisma.token.create({ data: { token, ownerId } })
    return token
  },

  /**
   * Consumes a friend token and returns its owner's user ID. It can be used to be friends with the owner.
   * @param token - Friend token
   * @returns Promise that resolves to the token owner's user ID when the token is valid, or `null` otherwise
   */
  redeemFriendToken: async (token: string): Promise<string | null> => {
    const tokenInfo = await prisma.token.findUnique({ where: { token } })
    if (tokenInfo == null) return null

    const expirationDate = structuredClone(tokenInfo.createdAt)
    expirationDate.setDate(expirationDate.getDate() + FRIEND_TOKEN_LIFE_DAYS)
    if (expirationDate < new Date()) return null

    return tokenInfo.ownerId
  },
}
