"use server"
import { Course } from "@/third-party/twinte-parser-type"
import { prisma } from "./prisma"

export async function resetAndUpdateUserCourses(userId: string, courses: Course[]) {
  try {
    await prisma.$transaction(async tx => {
      // ユーザーの既存のコースをすべて削除
      await tx.course.deleteMany({
        where: { userId: userId },
      })

      // 新しいコースを追加
      await tx.course.createMany({
        data: courses.map(course => ({
          userId: userId,
          code: course.code,
        })),
      })
    })

    return { success: true }
  } catch (error) {
    console.error("ユーザーのコース更新中にエラーが発生しました:", error)
    return { success: false, error: "コースの更新に失敗しました" }
  }
}

export async function getUserCourseIds(userId: string): Promise<string[]> {
  try {
    const userCourses = await prisma.course.findMany({
      where: { userId: userId },
    })

    // ここでは、Course型に合わせてデータを整形する必要があります
    // 実際のCourse型の構造に応じて、必要な情報を追加してください
    const courses = userCourses.map(course => ({
      code: course.code,
      // 他の必要なフィールドをここに追加
      // 例: name: '未設定', // または、別のクエリでコース名を取得する
    }))

    return courses.map(({ code }) => code)
  } catch (error) {
    console.error("ユーザーのコース取得中にエラーが発生しました:", error)
    throw new Error("コースの取得に失敗しました")
  }
}
