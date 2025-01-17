"use client"

import { Button } from "@/components/ui/button"
import { addEvent } from "@/lib/addEvent"
import { ExcludePeriod, Period, findFreePeriods, periodsOfUsers } from "@/lib/scheduling"
import { formatDate, formatDuration } from "@/lib/utils"
import { User } from "@prisma/client"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { WeekView } from "./WeekView"
import { Course } from "@/third-party/twinte-parser-type"
import { YesNoDialog } from "@/components/ui/dialog"
import { coursePeriodsThroughWeeks } from "@/lib/course"
import { CoursePeriod, courseToPeriods } from "@/lib/course"
import { getUserCourseCodes } from "@/lib/server"

type Props = {
  title: string
  users: User[]
  selectedUserIds: string[]
  excludePeriod: ExcludePeriod
  selectedDurationMinute: number
  /** 履修中の講義一覧 */
  courses: Course[]
  allCourses: Course[]
}

export default function Candidate(props: Props) {
  const [isButtonActive, setIsButtonActive] = useState(false)
  const [freePeriods, setFreePeriods] = useState<Period[]>([])
  // const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)
  const [spannedPeriod, setSpannedPeriod] = useState<Period | null>(null)

  const yesNoDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    setIsButtonActive(props.title.trim() !== "")
  }, [props.title])

  // 自分の授業とその時間の配列
  const coursePeriods: CoursePeriod[] = props.courses.map(course => ({
    course,
    periods: courseToPeriods(new Date(), course),
  }))

  async function handleSchedule() {
    setIsButtonActive(false)
    try {
      // 招待相手ごとの授業とその時間の配列
      const coursePeriodsOfGuests: CoursePeriod[][] = (
        await Promise.all(props.selectedUserIds.map(getUserCourseCodes))
      ).map(codes =>
        props.allCourses
          .filter(({ code }) => codes.includes(code))
          .map(course => ({
            course,
            periods: courseToPeriods(new Date(), course),
          })),
      )

      console.debug("自分の授業とその時間の配列", coursePeriods)
      console.debug("招待相手ごとの授業とその時間の配列", coursePeriodsOfGuests)

      // 自分と招待相手全員を合わせた授業時間の配列
      const classPeriodsOfUsers: Period[] = [...coursePeriodsOfGuests, coursePeriods].flatMap(
        coursePeriods => coursePeriods.flatMap(({ periods }) => periods),
      )

      console.debug("すべての授業の、授業時間の配列", classPeriodsOfUsers)

      const periods = [
        ...(await periodsOfUsers(props.selectedUserIds, props.excludePeriod)),
        classPeriodsOfUsers,
      ]

      const freePeriods = await findFreePeriods(props.selectedDurationMinute, periods)
      console.log("freePfreePeriods:", freePeriods)

      setFreePeriods(freePeriods)
    } catch (e) {
      toast("Sorry, free time compute error!", { type: "error", autoClose: false })
      console.error(e)
    } finally {
      setIsButtonActive(true)
    }
  }

  async function addConfirmedPeriodToCalendar(period_spanned: Period) {
    console.log("Adding")
    try {
      await addEvent({
        id: null,
        summary: props.title,
        start: period_spanned?.start,
        end: period_spanned?.end,
        description: null,
        location: null,
        status: "CONFIRMED",
        attendees: props.users.filter(user => props.selectedUserIds.includes(user.id)),
      })

      toast(
        `カレンダーに追加されました。\n${formatDate(period_spanned.start)} から${formatDuration(
          props.selectedDurationMinute,
        )}`,
        {
          onClick: () => {
            open("https://calendar.google.com/calendar", "_blank")
          },
        },
      )
    } catch (e) {
      toast("Sorry, calendar event addition error!", { type: "error", autoClose: false })
      console.error(e)
    }
  }

  async function handlePeriodClick(period: Period) {
    // setSelectedPeriod(period)

    const period_spanned: Period = {
      start: period.start,
      end: new Date(period.start.getTime() + 1000 * 60 * props.selectedDurationMinute),
    }
    setSpannedPeriod(period_spanned)
    yesNoDialogRef.current?.showModal()
  }

  function handleDialogConfirm() {
    if (!spannedPeriod) {
      toast("Invalid state: spannedPeriod is null", { type: "error" })
      return
    }
    addConfirmedPeriodToCalendar(spannedPeriod)
  }

  return (
    <div className="py-4">
      <YesNoDialog
        message="Are you sure you want to add this event to your calendar?"
        ref={yesNoDialogRef}
        onYes={() => handleDialogConfirm()}
        onNo={() => {}}
      />
      <Button onClick={handleSchedule} disabled={!isButtonActive} className="w-full">
        「{props.title || "-"}」の日時候補を探す
      </Button>
      {freePeriods.length > 0 ? (
        <WeekView
          currentDate={new Date()}
          handlePeriodClick={handlePeriodClick}
          periods={freePeriods}
          isButtonActive={isButtonActive}
          courses={props.courses}
        />
      ) : (
        ""
      )}

    </div>
  )
}
