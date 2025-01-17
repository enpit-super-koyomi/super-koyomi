"use client"

import React, { useState } from "react"
import { formatTime, getEventPosition } from "../../lib/draft/utils"
import { Period } from "@/lib/scheduling"
import { CoursePeriod } from "@/lib/course"
import { Course } from "@/third-party/twinte-parser-type"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type WeekViewProps = {
  periods: Period[]
  currentDate: Date
  handlePeriodClick: (period: Period) => Promise<void>
  isButtonActive: boolean
  coursePeriods: CoursePeriod[]
}

const handleClassClick = (courseWithPeriod: CourseWithPeriod) => {
  console.log("clicked:", courseWithPeriod)
}

type CourseWithPeriod = {
  course: Course
  period: Period
}

/**
 * 日時候補のカレンダー表示を提供します。
 * @param props - 各種プロパティ
 * @returns カレンダー表示のDOM要素
 */
export function WeekView({
  periods,
  currentDate,
  handlePeriodClick,
  isButtonActive,
  coursePeriods,
}: WeekViewProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)

  const weekDates = Array.from(Array(7).keys()).map(i => {
    const date = new Date(currentDate)
    date.setDate(currentDate.getDate() + i + currentWeekIndex * 7)
    return date
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const handleNextWeek = () => {
    setCurrentWeekIndex(prevIndex => Math.min(prevIndex + 1, 3))
  }

  const handlePreviousWeek = () => {
    setCurrentWeekIndex(prevIndex => Math.max(prevIndex - 1, 0))
  }
  console.log("coursePeriods:", coursePeriods)

  /** @todo Reduce this TOO DEEP nest */
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="flex justify-between mb-4">
        <Button
          onClick={handlePreviousWeek}
          disabled={currentWeekIndex === 0}
          variant="outline"
          size="icon"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">過去へ</span>
        </Button>
        <Button
          onClick={handleNextWeek}
          disabled={currentWeekIndex === 3}
          variant="outline"
          size="icon"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">先へ</span>
        </Button>
      </div>
      <div className="grid grid-cols-8 gap-px bg-gray-200">
        <div className="sticky left-0 bg-white "></div>
        {weekDates.map(date => (
          <div
            key={date.toISOString()}
            className="text-center text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl py-2 font-semibold bg-white"
          >
            {date.toLocaleDateString("ja-JP", {
              //日時
              weekday: "short",
              month: "numeric",
              day: "numeric",
            })}
          </div>
        ))}
      </div>
      <div className="relative grid grid-cols-8 gap-px bg-gray-200" style={{ height: "1440px" }}>
        {/* ↑縦線のスタイル */}
        <div className="sticky left-0 bg-white ">
          {hours.map(hour => (
            <div
              key={hour}
              className="h-[60px] border-t border-gray-200 text-xs text-gray-500 text-right pr-2"
            >
              {`${hour}:00`}
            </div>
          ))}
        </div>
        {weekDates.map(date => (
          <div key={date.toISOString()} className="relative bg-white">
            {hours.map(hour => (
              <div
                key={`${date.toISOString()}-${hour}`}
                className="absolute top-0 w-full h-[60px] border-t border-gray-100"
                style={{ top: `${hour * 60}px` }} // 1時間ごとに線を描画
              ></div>
            ))}
            {[
              ...periods
                .filter(period => period.start.toDateString() === date.toDateString())
                .map(period => {
                  const { top, height } = getEventPosition(period)
                  return (
                    <button
                      key={period.start.toString()}
                      disabled={!isButtonActive}
                      className={`absolute w-full px-1 py-1 text-xs border rounded overflow-hidden transition-opacity hover:opacity-100 opacity-50 text-transparent hover:text-black z-0 hover:z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        minHeight: "20px",
                        backgroundColor: `#f0be5c`, //lightsteelblue#b0c4de
                        borderColor: "#f0be5c", //lightsteelblue
                        // color: "black",
                      }}
                      onClick={() => handlePeriodClick(period)}
                    >
                      <div>
                        {formatTime(period.start)} {formatTime(period.end)}
                      </div>
                    </button>
                  )
                }),

              ...coursePeriods
                .flatMap(({ course, periods }) =>
                  periods.flatMap(period =>
                    period.start.toDateString() === date.toDateString() ? [{ course, period }] : [],
                  ),
                )
                .map(({ course, period }) => {
                  const { top, height } = getEventPosition(period)
                  return (
                    <button
                      key={period.start.toString()}
                      disabled={!isButtonActive}
                      className={`absolute w-full px-1 py-1 text-xs border rounded overflow-hidden transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        minHeight: "20px",
                        // backgroundColor: `#94dff3`, //lightsteelblue#b0c4de
                        borderColor: "black", //lightsteelblue
                        borderWidth: "3px",
                        // border: "dot 5px black",
                        //color: "black", //文字？
                      }}
                      onClick={() => handleClassClick({ course, period })}
                    >
                      <div>
                        <div>{course.name}</div>
                        <div>
                          {/* {formatTime(period.start)} {formatTime(period.end)} //時間割の時間の表示 */}
                        </div>
                      </div>
                    </button>
                  )
                }),
            ]}
          </div>
        ))}
      </div>
    </div>
  )
}
