"use client"

import React, { useState, useRef, useCallback } from "react"
import { formatTime, getEventPosition, getTimeFromPosition } from "../../lib/draft/utils"
import { Period } from "@/lib/scheduling"
import { CoursePeriod, courseToPeriods } from "@/lib/course"
import { Course } from "@/third-party/twinte-parser-type"
import { TimeSelectionModal } from "@/components/TimeSelectionModal"
import { ConfirmationPopup } from "@/components/ConfirmationPopup"

type WeekViewProps = {
  periods: Period[]
  currentDate: Date
  handlePeriodClick: (period: Period) => Promise<void>
  isButtonActive: boolean
  courses: Course[]
  onAddPeriod: (newPeriod: Period) => void
}

const handleClassClick = (courseWithPeriod: CourseWithPeriod) => {
  console.log("clicked:", courseWithPeriod)
}

type CourseWithPeriod = {
  course: Course
  period: Period
}

export function WeekView({
  periods,
  currentDate,
  handlePeriodClick,
  isButtonActive,
  courses,
  onAddPeriod,
}: WeekViewProps) {
  const weekDates = Array.from(Array(7).keys()).map(i => {
    const date = new Date(currentDate)
    date.setDate(currentDate.getDate() + i)
    return date
  })
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const coursePeriods: CoursePeriod[] = courses.map(course => ({
    course,
    periods: courseToPeriods(currentDate, course),
  }))

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null)
  const [initialStartTime, setInitialStartTime] = useState<Date | null>(null)
  const [initialEndTime, setInitialEndTime] = useState<Date | null>(null)

  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)

  const handleDateClick = useCallback((date: Date, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    const totalHeight = rect.height
    const clickedTime = getTimeFromPosition(y, totalHeight)

    if (isLongPressRef.current) {
      // 長押しの場合、モーダルを表示
      setSelectedDate(date)
      setSelectedPosition({ x: event.clientX, y: event.clientY })
      setIsModalOpen(true)
    } else {
      // 通常のクリックの場合、確認ポップアップを表示
      const startTime = new Date(date)
      startTime.setHours(clickedTime.hours, clickedTime.minutes, 0, 0)
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + 30)

      setSelectedDate(date)
      setInitialStartTime(startTime)
      setInitialEndTime(endTime)
      setIsConfirmationOpen(true)
    }
  }, [])

  const handleMouseDown = useCallback((date: Date, event: React.MouseEvent<HTMLDivElement>) => {
    isLongPressRef.current = false
    longPressTimeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true
    }, 500) // 500ミリ秒の長押しで発動
  }, [])

  const handleMouseUp = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
    }
  }, [])

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number)
      const startTime = new Date(selectedDate)
      startTime.setHours(hours, minutes, 0, 0)
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + 30)

      setInitialStartTime(startTime)
      setInitialEndTime(endTime)
      setIsModalOpen(false)
      setIsConfirmationOpen(true)
    }
  }

  const handleConfirm = (startTime: Date, endTime: Date) => {
    onAddPeriod({ start: startTime, end: endTime })
    setIsConfirmationOpen(false)
  }

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="grid grid-cols-8 gap-px bg-gray-200">
        <div className="sticky left-0 bg-white "></div>
        {weekDates.map(date => (
          <div
            key={date.toISOString()}
            className="text-center text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl py-2 font-semibold bg-white">
            {date.toLocaleDateString("ja-JP", {
              weekday: "short",
              month: "numeric",
              day: "numeric",
            })}
          </div>
        ))}
      </div>
      <div className="relative grid grid-cols-8 gap-px bg-gray-200" style={{ height: "1440px" }}>
        <div className="sticky left-0 bg-white ">
          {hours.map(hour => (
            <div
              key={hour}
              className="h-[60px] border-t border-gray-200 text-xs text-gray-500 text-right pr-2">
              {`${hour}:00`}
            </div>
          ))}
        </div>
        {weekDates.map(date => (
          <div
            key={date.toISOString()}
            className="relative bg-white"
            onClick={(e) => handleDateClick(date, e)}
            onMouseDown={(e) => handleMouseDown(date, e)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {[
              ...periods
                .filter(period => period.start.toDateString() === date.toDateString())
                .map(period => {
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
                        backgroundColor: `#f0be5c`,
                        borderColor: "#f0be5c",
                        color: "black",
                      }}
                      // onClick={(e) => {
                      //   e.stopPropagation()
                      //   handlePeriodClick(period)
                      // }}
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
                    period.start.toDateString() === date.toDateString()
                      ? [{ course, period }]
                      : []
                  )
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
                        borderColor: "black",
                        borderWidth: "3px",
                        color: "black",
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClassClick({ course, period })
                      }}>
                      <div>
                        <div>{course.name}</div>
                        <div>
                          {formatTime(period.start)} {formatTime(period.end)}
                        </div>
                      </div>
                    </button>
                  )
                }),
            ]}
          </div>
        ))}
      </div>
      <TimeSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectTime={handleTimeSelect}
        date={selectedDate || new Date()}
        position={selectedPosition}
      />
      <ConfirmationPopup
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirm}
        initialStartTime={initialStartTime || new Date()}
        initialEndTime={initialEndTime || new Date()}
      />
    </div>
  )
}

