import { setTimes } from "./utils"
import { Period } from "./scheduling"
import { Course, Day, Module } from "@/third-party/twinte-parser-type"
import { FETCH_EVENTS_DAYS } from "./const"

export type CoursePeriod = {
  course: Course
  periods: Period[]
}

/** 日月火水木金土 */
export const DAY_OF_WEEKS = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat] as const

/**
 * 基準の日時と科目の曜日情報とから、次の授業の日時を求めます。
 * @param currentDate - 基準日時
 * @param day - 科目の曜日
 * @returns 次回授業の日時。曜日が「随時」などで確定できない場合は undefined
 */
const nextDateOfDay = (currentDate: Date, day: Day) => {
  const i = DAY_OF_WEEKS.findIndex(v => v == day)
  if (i < 0) return undefined
  const j = currentDate.getDay()
  const date = new Date(currentDate)
  const offset = i - j // 0 <= i,j <= 6
  date.setDate(date.getDate() + (offset < 0 ? offset + 7 : offset)) // mod offset 7 を基準日に足す
  return date
}

const CLASS_START_TIMES = [
  [8, 40],
  [10, 10],
  [12, 15],
  [13, 45],
  [15, 15],
  [16, 45],
] as const

const classLengthMinutes: number = 75
type CourseSchedule = Course["schedules"][0]

const isNextSchedule = (prevSchedule: CourseSchedule, schedule: CourseSchedule) =>
  prevSchedule.module == schedule.module &&
  prevSchedule.day == schedule.day &&
  prevSchedule.period + 1 == schedule.period

/**
 * 現在（or与えられた日時が？）どのモジュール期間であるかを返します。
 * @todo
 * @returns 基本の６モジュールの時はその文字列を返す（"春A"）。そうでない場合は"Unknown"を返す。
 */
const getCurrentModule = (): Module => {
  //春Aから秋Cまでの開始と終了日時を定義
  const startSpringA = new Date(2024, 4, 15)
  const startSpringB = new Date(2024, 5, 24)
  const startSpringC = new Date(2024, 7, 5)
  const endSpringC = new Date(20204, 8, 9)
  const startFallA = new Date(2024, 10, 1)
  const startFallB = new Date(2024, 11, 11)
  const endFallB = new Date(2024, 12, 25)
  const startFallC = new Date(2025, 1, 6)
  const endFallC = new Date(2025, 2, 27)
  //現在の日時を取得
  const currentDate = new Date()
  if (currentDate < startSpringA) {
    return Module.Unknown
  }
  if (currentDate >= startSpringA && currentDate < startSpringB) {
    return Module.SpringA
  }
  if (currentDate >= startSpringB && currentDate < startSpringC) {
    return Module.SpringB
  }
  if (currentDate >= startSpringC && currentDate < endSpringC) {
    return Module.SpringC
  }
  if (currentDate >= startFallA && currentDate < startFallB) {
    return Module.FallA
  }
  if (currentDate >= startFallB && currentDate < endFallB) {
    return Module.FallB
  }
  if (currentDate >= startFallC && currentDate < endFallC) {
    return Module.FallC
  }
  return Module.Unknown
}

/**
 * 科目について、ある時刻以降の授業時間帯をすべて取得する。
 * @param baseDate - 基準日時。これ以降の授業時間帯を取得する
 * @param course - 科目データ
 * @returns 授業時間帯（開始・終了時刻の組）の配列
 */
export const courseToPeriods = (baseDate: Date, course: Course): Period[] => {
  const currentModule = getCurrentModule()
  const currentSchedules = course.schedules.filter(s => s.module == currentModule.toString())
  const periods = currentSchedules
    .flatMap(s => {
      const nextClassDate = nextDateOfDay(baseDate, s.day)
      if (nextClassDate == undefined) {
        console.log("s:", s)
        console.log(`nextDateOfDay(${baseDate.toISOString()}, ${s.day}) == undefined`)
        return []
      }

      const startTime = CLASS_START_TIMES.at(s.period - 1)
      if (startTime == undefined) {
        console.log("s:", s)
        console.log(`classStartTimes.at(s.period)==undefined`)
        return []
      }
      const [hh, mm] = startTime
      const start = setTimes(nextClassDate)(hh, mm)
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + classLengthMinutes)

      return { start, end }
    })
    .filter(date => date != undefined)

  // 連続するnコマを一つの period にまとめる

  const {
    p: [periodss, lastPeriods],
  } = periods.reduce(
    ({ lastSchedule, p: [periodss, periods] }, period, i) => {
      const schedule = currentSchedules[i]
      return (lastSchedule ? isNextSchedule(lastSchedule, schedule) : true)
        ? { lastSchedule: schedule, p: [periodss, [...periods, period]] }
        : { lastSchedule: schedule, p: [[...periodss, periods], [period]] }
    },
    { lastSchedule: undefined, p: [[], []] } as {
      lastSchedule: CourseSchedule | undefined
      p: [Period[][], Period[]]
    },
  )

  return [...periodss, lastPeriods].flatMap(periods =>
    periods.length == 0
      ? []
      : [
          {
            start: periods[0].start,
            end: periods[periods.length - 1].end,
          },
        ],
  )
}

export const coursePeriodsThroughWeeks = (courses: Course[], currentDate: Date): CoursePeriod[] => {
  const weekIndice = Array.from({ length: Math.ceil(FETCH_EVENTS_DAYS / 7) + 1 }, (_, i) => i)

  console.log("weekIndice", weekIndice)

  const coursePeriods: CoursePeriod[] = courses.map(course => {
    const periods = courseToPeriods(currentDate, course).flatMap(period =>
      weekIndice.map(i => {
        const p = {
          start: new Date(period.start),
          end: new Date(period.end),
        }
        p.start.setDate(p.start.getDate() + 7 * i)
        p.end.setDate(p.end.getDate() + 7 * i)
        return p
      }),
    )

    return { course, periods }
  })

  console.log("coursePeriods:", coursePeriods)

  return coursePeriods
}

// export const mixFreeClassPeriod = (freePeriods: Period[], classPeriod: Period[]) => {

// }
