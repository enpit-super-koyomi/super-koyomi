import { setTimes } from "./utils"
import { Period } from "./scheduling"
import { Course, Day } from "@/third-party/twinte-parser-type"

export type CoursePeriod = {
	course: Course
	periods: Period[]
}

export const courseDays: Day[] = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat]

const nextDateOfDay = (currentDate: Date, day: Day) => {
	if (
		day === Day.Intensive ||
		day === Day.Appointment ||
		day === Day.AnyTime ||
		day === Day.Unknown
	) {
		console.log("Day exception")
		return undefined
	}

	const i = courseDays.findIndex(v => v == day)
	if (i < 0) return undefined
	const j = currentDate.getDay()
	const date = new Date(currentDate)
	const offset = i - j // 0 <= i,j <= 6
	date.setDate(date.getDate() + (offset < 0 ? offset + 7 : offset)) // mod offset 7 を基準日に足す
	return date
}

const classStartTimes: [number, number][] = [
	[8, 40],
	[10, 10],
	[12, 15],
	[13, 45],
	[15, 15],
	[16, 45],
]

const classLengthMinutes: number = 75
type CourseSchedule = Course["schedules"][0]

const isNextSchedule = (prevSchedule: CourseSchedule, schedule: CourseSchedule) =>
	prevSchedule.module == schedule.module &&
	prevSchedule.day == schedule.day &&
	prevSchedule.period + 1 == schedule.period

// todo
const getCurrentModule = () => {
  return "秋B"
}

/**
 * 科目について、ある時刻以降の授業時間帯をすべて取得する。
 * @param baseDate - 基準日時。これ以降の授業時間帯を取得する
 * @param course - 科目データ
 * @returns 授業時間帯（開始・終了時刻の組）の配列
 */
export const courseToPeriods = (baseDate: Date, course: Course): Period[] => {
  const currentModule = getCurrentModule()
  const currentSchedules = course.schedules
    .filter(s => s.module == currentModule)
	const periods = currentSchedules
		.flatMap(s => {
			const date = nextDateOfDay(baseDate, s.day)
			if (date == undefined) {
				console.log("s:", s)
				console.log(`nextDateOfDay(${baseDate.toISOString()}, ${s.day}) == undefined`)
				return []
			}

			const startTime = classStartTimes.at(s.period -1)
			if (startTime == undefined) {
				console.log("s:", s)
				console.log(`classStartTimes.at(s.period)==undefined`)
				return []
			}
			const [hh, mm] = startTime
			const start = setTimes(date)(hh, mm)
			const end = new Date(start)
			end.setMinutes(end.getMinutes() + classLengthMinutes)

			return { start, end }
		})
		.filter(date => date != undefined)

  // 連続するnコマを一つの period にまとめる

	const {p: [periodss, lastPeriods]} = periods.reduce(
		({lastSchedule, p: [periodss, periods]}, period, i) => {
			const schedule = currentSchedules[i]
			return (lastSchedule ? isNextSchedule(lastSchedule, schedule) : true)
				? { lastSchedule: schedule, p: [periodss, [...periods, period]]}
				: { lastSchedule: schedule, p: [[...periodss, periods], [period]]}
		},
		{ lastSchedule: undefined, p: [[], []] } as { lastSchedule: CourseSchedule | undefined, p: [Period[][], Period[]] }
	)

	return [...periodss, lastPeriods].flatMap(periods =>
		periods.length == 0
			? []
			: [
					{
						start: periods[0].start,
						end: periods[periods.length - 1].end,
					},
			  ]
	)
}

// export const mixFreeClassPeriod = (freePeriods: Period[], classPeriod: Period[]) => {

// }
