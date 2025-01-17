import { db } from "@/lib/prisma"
import SchedulePlanner from "@/app/adjust/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchCourses } from "@/third-party/twinte-parser"
import { Course } from "@/third-party/twinte-parser-type"
import { getUserCourseIds } from "@/lib/server"

export default async function AdjustPage() {
  const session = await getServerSession(authOptions)
  const users = (await db.allUsers()).filter(user => user.email !== session?.user.email)
  const allCourses = (await fetchCourses()) as Course[]
  // console.log(allCourses)

  const userCourseIds = session?.user.id ? await getUserCourseIds(session.user.id) : undefined
  console.log("userCourseIds:", userCourseIds)

  const courses = allCourses.filter(course => userCourseIds?.includes(course.code))

  return (
    <SchedulePlanner
      users={users}
      currentUserId={session?.user.id ?? null}
      allCourses={allCourses}
      courses={userCourseIds ? courses : undefined}
    />
  )
}
