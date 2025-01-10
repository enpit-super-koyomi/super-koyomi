"use server"
import { Course, Day } from "@/third-party/twinte-parser-type"
import { Db, db } from "./prisma"


export const insertCoursesForUserOnFileLoad = async (courses: Course[], userId: string) => {
  // const res = await db.insertCoursesForUser(courses, userId)
  await Db.setCoursesForUser(courses, userId)
}