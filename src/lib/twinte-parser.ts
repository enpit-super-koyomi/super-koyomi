"use server"

import { downloadKDB, parseKDB } from "twinte-parser"
const kdb = downloadKDB()

export const loadCourses = async() => await parseKDB(await kdb);

export const getCourse = async(code: string) => {
  return (await loadCourses()).find(course => course.code == code)
}

export const parseRSReferToCodes = (content: string): string[] =>
  content.split("\n")
    .map(line => line.slice(1, -1));