import { start } from "repl"
import { Course, Day } from "twinte-parser"

export type CoursePeriod = {
  course: Course,
  period: Period
}

const courseDays = [
  Day.Sun,
  Day.Mon,
  Day.Tue,
  Day.Wed,
  Day.Thu,
  Day.Fri,
  Day.Sat
]

const nextDateOfDay = (currentDate: Date, day: Day) => {
  if (day == Day.Intensive || day == Day.Appointment || day == Day.AnyTime || Day.Unknown) return undefined

  const i = courseDays.findIndex(v => v == day)
  if (i < 0) return undefined
  const j = currentDate.getDay()
  const date = new Date(currentDate)
  date.setDate(date.getDate() + i - j)
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

const classLengthMinutes = 75

export const courseToPeriods = (baseDate: Date, course: Course): Period[] => {
  return course.schedules
    .flatMap(s => {
      const date = nextDateOfDay(baseDate, s.day)
      if (date ==undefined) return []
      const startTime = classStartTimes.at(s.period)
      if (startTime == undefined) return []
      const [hh, mm] = startTime
      setTimes
    })
    .filter(date => date != undefined)
}