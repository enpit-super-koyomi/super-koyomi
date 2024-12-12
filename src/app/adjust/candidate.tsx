"use client"

import { Button } from "@/components/ui/button"
import { addEvent } from "@/lib/addEvent"
import { ExcludePeriod, Period, findFreePeriods, periodsOfUsers } from "@/lib/scheduling"
import { formatDate, formatDuration } from "@/lib/utils"
import { User } from "@prisma/client"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { WeekView } from "./WeekView"
import { YesNoDialog } from "@/components/ui/dialog"

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
	const [spannedPeriod, setSpannedPeriod] = useState<Period | null>(null)

	const yesNoDialogRef = useRef<HTMLDialogElement>(null)

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
			toast("Sorry, free time compute error!", { type: "error", autoClose: false });
			console.error(e)
		} finally {
			setIsButtonActive(true)
		}
	}

	async function addConfirmedPeriodToCalendar(period_spanned: Period) {
		console.log("Adding")
		try {
			// const end = new Date(period.start)
			// end.setMinutes(end.get props.selectedDurationMinute)

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
					props.selectedDurationMinute
				)}`,
				{
					onClick: () => {
						open("https://calendar.google.com/calendar", "_blank")
					},
				}
			)
		} catch (e) {
			toast("Sorry, calendar event addition error!", { type: "error", autoClose: false });
			console.error(e)
		}
	}

	async function handlePeriodClick(period: Period) {
		setSelectedPeriod(period)

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
			<ul className="py-4 space-y-2">
				{freePeriods.length > 0
				? <WeekView
					currentDate={new Date()}
					handlePeriodClick={handlePeriodClick}
					periods={freePeriods}
					isButtonActive={isButtonActive}
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
