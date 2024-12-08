"use client"

import { Button } from "@/components/ui/button"
import { addEvent } from "@/lib/addEvent"
import { ExcludePeriod, Period, findFreePeriods, periodsOfUsers } from "@/lib/scheduling"
import { formatDate, formatDuration } from "@/lib/utils"
import { User } from "@prisma/client"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { WeekView } from "./WeekView"
import { ExcludePeriodState, fitExcludePeriods } from "@/lib/draft/utils"

type Props = {
	title: string
	users: User[]
	selectedUserIds: string[]
	excludePeriod: ExcludePeriod
	selectedDurationMinute: number
}

export default function Candidate({excludePeriod, ...props}: Props) {
	const [isButtonActive, setIsButtonActive] = useState(false)
	const [freePeriods, setFreePeriods] = useState<Period[]>([])
	const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)
	const [excludePeriodState, setExcludePeriodState] = useState<ExcludePeriodState>({
		calendar: { start: 0, end: 0 } // calendar に適用する除外時間
	})

  useEffect(()=>{
		console.log("freePeriods", freePeriods)
		const threshold = fitExcludePeriods(excludePeriod, freePeriods)
		// ...excludePeriod, ...threshold として元の範囲をそこから削った範囲に上書きして excludePeriodState.calendar を更新
		const calendar = {...excludePeriod, ...threshold}
		if (threshold != null) setExcludePeriodState(state => ({...state, calendar}))

    console.log("excludePeriod", excludePeriod)
    console.log("threshold", threshold)
		console.log("ExcludePeriodState.calendar", calendar)
  }, [freePeriods, excludePeriod])

	useEffect(() => {
		setIsButtonActive(props.title.trim() !== "")
	}, [props.title])

	async function handleSchedule() {
		setIsButtonActive(false)
		try {
			const periods = await periodsOfUsers(props.selectedUserIds, excludePeriod)

			const freePeriods = await findFreePeriods(props.selectedDurationMinute, periods)

			setFreePeriods(freePeriods)
			setExcludePeriodState({...excludePeriodState, calculated: excludePeriod})
		} catch (e) {
			window.alert("Sorry, an error has occurred!")
			console.error(e)
		} finally {
			setIsButtonActive(true)
		}
	}

	async function handlePeriodClick(period: Period) {
		setIsButtonActive(false)
		setSelectedPeriod(period)
		try {
			// const end = new Date(period.start)
			// end.setMinutes(end.get props.selectedDurationMinute)
			const period_spanned: Period = {
				start: period.start,
				end: new Date(period.start.getTime() + 1000 * 60 * props.selectedDurationMinute),
			}

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
				`カレンダーに追加されました。\n${formatDate(period.start)} から${formatDuration(
					props.selectedDurationMinute
				)}`,
				{
					onClick: () => {
						open("https://calendar.google.com/calendar", "_blank")
					},
				}
			)
		} catch (e) {
			window.alert("Sorry, an error has occurred!")
			console.error(e)
		} finally {
			setIsButtonActive(true)
		}
	}

	return (
		<div className="py-4">
			<Button onClick={handleSchedule} disabled={!isButtonActive} className="w-full">
				「{props.title || "-"}」の日時候補を探す
			</Button>
			<ul className="py-4 space-y-2">
				{freePeriods.length > 0
				? <WeekView
					currentDate={new Date()}
					handlePeriodClick={handlePeriodClick}
					periods={freePeriods}
					isButtonActive={isButtonActive}
					excludePeriodState={excludePeriodState}
				/> : ""}

				{freePeriods.map(period => (
					<li key={period.start.toString()}>
						<Button
							disabled={!isButtonActive}
							variant={selectedPeriod?.start === period.start ? "secondary" : "ghost"}
							className="w-full justify-between font-normal"
							onClick={() => handlePeriodClick(period)}>
							<span className="flex items-center mr-2 h-4 w-4">
								<span>{formatDate(period.start)}</span>
								<span className="px-2">～</span>
								<span>{formatDate(period.end)}</span>
							</span>
							{/* <ChevronRight className="h-4 w-4" /> */}
						</Button>
					</li>
				))}
			</ul>
		</div>
	)
}
