"use client"

import { Button } from "@/components/ui/button"
import { addEvent } from "@/lib/addEvent"
import { ExcludePeriod, Period, findFreePeriods, periodsOfUsers } from "@/lib/scheduling"
import { formatDate, formatDuration } from "@/lib/utils"
import { User } from "@prisma/client"
import { Dispatch, useEffect, useState } from "react"
import { toast } from "react-toastify"

type Props = {
	title: string
	users: User[]
	selectedUserIds: string[]
	excludePeriod: ExcludePeriod
	selectedDurationMinute: number
}

export default function Candidate(props: Props) {
	const [isButtonActive, setIsButtonActive] = useState(false)
	const [freePeriods, setFreePeriods] = useState<Period[]>([])
	const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)

	useEffect(() => {
		setIsButtonActive(props.title.trim() !== "")
	}, [props.title])

	async function handleSchedule() {
		setIsButtonActive(false)
		try {
			const periods = await periodsOfUsers(props.selectedUserIds, props.excludePeriod)

			const freePeriods = await findFreePeriods(props.selectedDurationMinute, periods)
			console.log("freePfreePeriods:", freePeriods)

			setFreePeriods(freePeriods)
		} catch (e) {
			window.alert("Sorry, an error has occurred!")
			console.error(e)
		} finally {
			setIsButtonActive(true)
		}
	}

	async function handlePeriodClick(period: Period) {
		setIsButtonActive(false)
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

// const TimeSlot = ({
// 	setIsButtonActive
// }: {
// 	setIsButtonActive: React.Dispatch<React.SetStateAction<boolean>>
// }) => {
// 	return (
// 		<Button
// 							variant={selectedPeriod?.start === period.start ? "secondary" : "ghost"}
// 							className="w-full justify-between font-normal"
// 							onClick={() => handlePeriodClick(period)}>
// 							<span className="flex items-center mr-2 h-4 w-4">
//                 <span>{formatDate(period.start)}</span>
//                 <span className="px-2">～</span>
//                 <span>{formatDate(period.end)}</span>
//               </span>
// 							{/* <ChevronRight className="h-4 w-4" /> */}
// 						</Button>
// 	)
// }
