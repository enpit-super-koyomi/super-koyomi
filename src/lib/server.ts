"use server"
import { Course } from "@/third-party/twinte-parser-type"
import { getUserCourseIds, prisma, setCoursesForUser } from "./prisma"
export const insertCoursesForUserOnFileLoad = async (courses: Course[], userId: string) => {
  // const res = await db.insertCoursesForUser(courses, userId)
  await setCoursesForUser(courses, userId)
}

export const getUserCourses = async (userId: string): Promise<Course[] | undefined> => {
  const courseIds = await getUserCourseIds(userId)
  if (courseIds == undefined) return undefined

}
