"use server"

import { downloadKDB, parseKDB } from "twinte-parser"

export const loadCourses = async(year?: number) => {
  const kdb = await downloadKDB(year)
  return await parseKDB(kdb)
}

export const getCourse = async(code: string) => {
  return (await loadCourses()).find(course => course.code == code)
}

