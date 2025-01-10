"use server"
import { Course } from "@/third-party/twinte-parser-type"
import { setCoursesForUser } from "./prisma"
export const insertCoursesForUserOnFileLoad = async (courses: Course[], userId: string) => {
  // const res = await db.insertCoursesForUser(courses, userId)
  await setCoursesForUser(courses, userId)
}
