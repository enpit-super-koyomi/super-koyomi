import {
  // $Enums,
  Account, PrismaClient, User, PrismaPromise } from "@prisma/client"
import { Course } from "@/third-party/twinte-parser-type"
import { Module, Day } from "@/third-party/twinte-parser-type"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// export const moduleAsPrismaEnum = (module: Module): $Enums.Module =>
//   module == Module.SpringA
//     ? "SpringA"
//     : module == Module.SpringB
//       ? "SpringB"
//       : module == Module.SpringC
//         ? "SpringC"
//         : module == Module.FallA
//           ? "FallA"
//           : module == Module.FallB
//             ? "FallB"
//             : module == Module.FallC
//               ? "FallC"
//               : module == Module.SummerVacation
//                 ? "SummerVacation"
//                 : module == Module.SpringVacation
//                   ? "SpringVacation"
//                   : module == Module.Annual
//                     ? "Annual"
//                     : "Unknown"

// export const dayAsPrismaEnum = (day: Day): $Enums.Day =>
//   day == Day.Sun
//     ? "Sun"
//     : day == Day.Mon
//       ? "Mon"
//       : day == Day.Tue
//         ? "Tue"
//         : day == Day.Wed
//           ? "Wed"
//           : day == Day.Thu
//             ? "Thu"
//             : day == Day.Fri
//               ? "Fri"
//               : day == Day.Sat
//                 ? "Sat"
//                 : day == Day.Intensive
//                   ? "Intensive"
//                   : day == Day.Appointment
//                     ? "Appointment"
//                     : day == Day.AnyTime
//                       ? "AnyTime"
//                       : "Unknown"

// const scheduleAsPrisma = (schedule: {
//   module: Module
//   day: Day
//   period: number
//   room: string
// }) => ({
//   ...schedule,
//   module: moduleAsPrismaEnum(schedule.module),
//   day: dayAsPrismaEnum(schedule.day),
// })

const upsertCourseConnectUser = async (course: Course, userId: string) => {
  // const existingCourse = await prisma.course.findUnique({
  //   where: { code: course.code },
  // })

  const update = {
    users: {
      connect: [{ id: userId }],
    },
  }

  return prisma.course
    .update({
      where: { code: course.code },
      data: {
        ...update,
      },
    })
}

const upsertCourses = async (courses: Course[], userId: string) => {
  const upsertPromises = courses.map(async course => upsertCourseConnectUser(course, userId))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await prisma.$transaction(upsertPromises as PrismaPromise<any>[])
}

export const resetUserCourses = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { courses: { set: [] } },
  })
}

export const setCoursesForUser = async (courses: Course[], userId: string) => {
  const r = await resetUserCourses(userId)
  console.log("resetUserCourses:", r)
  const s = await upsertCourses(courses, userId)
  console.log("upsertCourses:", s)
}

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { schedules, ...withoutSchedules } = course
      return {
        ...withoutSchedules,
        schedules: {
          connect: [{}],
        },
        users: {
          connect: [{ id: userId }],
        },
      }
    })

    const res = await prisma.course.createMany({ data: coursesConnected })
    console.log(res)
    const resUpd = await prisma.course.updateMany({ data: courses })
    console.log(resUpd)
  },

}

export const getUserCourseIds = async (userId: string): Promise<string[] | undefined> => {
  const userWithCourses = await prisma.user.findUnique({
    where: { id: userId },
    include: { courses: true }
  })

  return userWithCourses?.courses.map(({ code }) => code)
}
