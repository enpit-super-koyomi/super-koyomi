import { Account, PrismaClient, User, Course as PrismaCourse } from "@prisma/client"
import { Course } from "@/third-party/twinte-parser-type"

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

  insertCoursesForUser: async (courses: Course[], userId: string) => {
    const coursesConnected = courses.map(course => {
      const { schedules, ...withoutSchedules} = course
      return {
      ...withoutSchedules,
        schedules: {
          connect: [
            {}
          ]
        },
        users: {
          connect: [ { id: userId }]
        }
      }
    })

    const res = await prisma.course.createMany({ data: coursesConnected })
    console.log(res)
    const resUpd = await prisma.course.updateMany({ data: courses })
    console.log(resUpd)
  }
}