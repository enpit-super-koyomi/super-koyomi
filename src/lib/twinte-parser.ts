"use server"

import fs from "fs"
import path from "path"

export const fetchCourses = () => {
  const filePath = path.join(process.cwd(), "public", "kdb.json")
  const jsonData = fs.readFileSync(filePath, "utf-8")
  console.log(jsonData.slice(0, 100))
  const data = JSON.parse(jsonData)
  return data
  // as unknown as Course[]
}

// export const loadCourses = async(year?: number) => {
//   const kdb = await downloadKDB(year)
//   return await parseKDB(kdb)
// }

// export const getCourse = async(code: string) => {
//   return (await loadCourses()).find(course => course.code == code)
// }

