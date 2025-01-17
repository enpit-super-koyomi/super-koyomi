import {
  // $Enums,
  Account,
  PrismaClient,
  User,
} from "@prisma/client"

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
}
