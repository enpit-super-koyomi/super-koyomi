import { $Enums, Account, PrismaClient, User, PrismaPromise } from "@prisma/client"
import { Course } from "@/third-party/twinte-parser-type"
import { Module, Day } from "@/third-party/twinte-parser-type"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const moduleAsPrismaEnum = (module: Module): $Enums.Module =>
  module == Module.SpringA
    ? "SpringA"
    : module == Module.SpringB
      ? "SpringB"
      : module == Module.SpringC
        ? "SpringC"
        : module == Module.FallA
          ? "FallA"
          : module == Module.FallB
            ? "FallB"
            : module == Module.FallC
              ? "FallC"
              : module == Module.SummerVacation
                ? "SummerVacation"
                : module == Module.SpringVacation
                  ? "SpringVacation"
                  : module == Module.Annual
                    ? "Annual"
                    : "Unknown"

export const dayAsPrismaEnum = (day: Day): $Enums.Day =>
  day == Day.Sun
    ? "Sun"
    : day == Day.Mon
      ? "Mon"
      : day == Day.Tue
        ? "Tue"
        : day == Day.Wed
          ? "Wed"
          : day == Day.Thu
            ? "Thu"
            : day == Day.Fri
              ? "Fri"
              : day == Day.Sat
                ? "Sat"
                : day == Day.Intensive
                  ? "Intensive"
                  : day == Day.Appointment
                    ? "Appointment"
                    : day == Day.AnyTime
                      ? "AnyTime"
                      : "Unknown"

const scheduleAsPrisma = (schedule: {
  module: Module
  day: Day
  period: number
  room: string
}) => ({
  ...schedule,
  module: moduleAsPrismaEnum(schedule.module),
  day: dayAsPrismaEnum(schedule.day),
})

// const upsertSchedulesOfCourses = async (courses: Course[]) => {
//   return prisma.$transaction(courses.flatMap(course => {

//     return course.schedules
//     .map(scheduleAsPrisma)
//     .map(schedule => prisma.courseSchedule.upsert({
//       where: {
//         module_day_period_room: schedule
//       },
//       create: {
//         ...schedule,
//         courseCode: course.code
//       },
//       update: schedule,
//     }))

//   }))
// }

const upsertCourseConnectUser = async (course: Course, userId: string) => {
  const existingCourse = await prisma.course.findUnique({
    where: { code: course.code },
  })

  const update = {
    name: course.name,
    credits: course.credits,
    overview: course.overview,
    remarks: course.remarks,
    type: course.type,
    recommendedGrade: course.recommendedGrade,
    instructor: course.instructor,
    error: course.error,
    lastUpdate: course.lastUpdate,
    users: {
      connect: [{ id: userId }],
    },
  }

  // const schedules = {
  //   connectOrCreate: course.schedules.map(s => ({
  //     module_day_period_room: scheduleAsPrisma(s)
  //   }))
  // }

  const where = { code: course.code }

  const upsertSchedules = () => {
    const schedulePromises = course.schedules.map(scheduleAsPrisma).map(schedule => {
      return prisma.courseSchedule.upsert({
        where: {
          module_day_period_room: schedule,
        },
        update: {
          courseCode: course.code,
        },
        create: {
          ...schedule,
          courseCode: course.code,
        },
      })
    })

    return prisma.$transaction(schedulePromises)
  }

  if (existingCourse && new Date(course.lastUpdate) > new Date(existingCourse.lastUpdate)) {
    return prisma.course
      .update({
        where,
        data: {
          ...update,
        },
      })
      .then(upsertSchedules)
  } else {
    return prisma.course
      .upsert({
        where,
        update: {
          ...update,
        },
        create: {
          ...update,
          ...where,
        },
      })
      .then(upsertSchedules)
  }
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
