"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

import { dateToGCalFormat } from "@/lib/utils"
import { Period, schedule } from "@/lib/scheduling"
import { getGuestsEvents, getHostEvents } from "@/lib/getEvents"

import { User } from "@prisma/client"

// const people = [
// 	{ id: 1, name: "HosokawaR", mail: "superkoyomi1@gmail.com" },
// 	{ id: 2, name: "Sakana", mail: "superkoyomi2@gmail.com" },
// 	{ id: 3, name: "Licht", mail: "superkoyomi3@gmail.com" },
// 	{ id: 4, name: "uxiun", mail: "superkoyomi4@gmail.com" },
// 	{ id: 5, name: "なぐ", mail: "superkoyomi5@gmail.com" },
// 	{ id: 6, name: "しゅんたろう", mail: "hiromichiosato@gmail.com" },
// ]

export default function SchedulePlanner({ users }: { users: User[] }) {
	const [title, setTitle] = useState("")
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
	const [selectedDurationMinute, setSelectedDurationMinute] = useState<number>(60)
	const [isButtonActive, setIsButtonActive] = useState(false)

	useEffect(() => {
		setIsButtonActive(title.trim() !== "" && selectedUserIds.length > 0)
	}, [title, selectedUserIds])

	async function findPeriod() {
		// const userIds : string[]= [/* "some_id", "some_id" */];
		const userIds = users.map(v => v.id)
		const hostEvents = await getHostEvents()
		const guestsEvents = await getGuestsEvents(userIds)
		const periodsByUser: Period[][] = [...guestsEvents, hostEvents ?? []]
		console.log(periodsByUser)

		const foundPeriod = schedule(selectedDurationMinute, periodsByUser)

		// const oktime = freetimes.find(time => {
		//   const dif_hour = (time.end.getTime() - time.start.getTime()) / (60*60*1000)
		//   return dif_hour >= 1
		// })

		return foundPeriod
	}

	async function handleSchedule() {
		setIsButtonActive(false)
		try {
			const period = await findPeriod()
			const date_s = dateToGCalFormat(period?.start ?? new Date())
			const date_f = dateToGCalFormat(period?.end ?? new Date())
			const selectedGuests = users
				.filter(user => selectedUserIds.includes(user.id))
				.map(user => user.email)
				.join(",")
			const retry_URL = `https://app.superkoyomi.org/retry/test_id?title=${encodeURIComponent(
				title
			)}&selectedGuest=${selectedGuests}`
			const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
				title
			)}&dates=${date_s}/${date_f}&add=${selectedGuests}&details=${encodeURIComponent(retry_URL)}`
			window.open(calendarUrl, "_blank")
		} catch (e) {
			window.alert("Sorry, an error has occurred!")
			console.error(e)
		} finally {
			setIsButtonActive(true)
		}
	}

	return (
		<div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
			<h1 className="text-2xl font-bold mb-4">日程調整</h1>
			<div className="space-y-4">
				<div>
					<Label htmlFor="title">予定のタイトル</Label>
					<Input
						id="title"
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder="予定のタイトルを入力"
					/>
				</div>
				<div>
					<Label htmlFor="duration-select">時間の長さを選択（30分間隔）</Label>
					<SelectDuration defaultValue={60} dispatch={setSelectedDurationMinute} />
				</div>
				<div>
					<Label>招待する人</Label>
					<div className="mt-2 space-y-2">
						{users.map(user => (
							<div key={user.id} className="flex items-center">
								<Checkbox
									id={`person-${user.id}`}
									checked={selectedUserIds.includes(user.id)}
									onCheckedChange={checked => {
										setSelectedUserIds(
											checked
												? [...selectedUserIds, user.id]
												: selectedUserIds.filter(id => id !== user.id)
										)
									}}
								/>
								<Label htmlFor={`person-${user.id}`} className="ml-2">
									{user.name}
								</Label>
							</div>
						))}
					</div>
				</div>
				<Button onClick={handleSchedule} disabled={!isButtonActive} className="w-full">
					「{title || "-"}」の日時を決定する
				</Button>
			</div>
		</div>
	)
}

function SelectDuration({
	defaultValue,
	dispatch,
}: {
	defaultValue: number
	dispatch: React.Dispatch<React.SetStateAction<number>>
}) {
	const onChange = (value: string) => {
		const n = parseInt(value)
		dispatch(n)
	}

	const formatDuration = (minutes: number) => {
		if (minutes === 0) return "0分"
		if (minutes < 60) return `${minutes}分`
		const hours = Math.floor(minutes / 60)
		const remainingMinutes = minutes % 60
		if (remainingMinutes === 0) return `${hours}時間`
		return `${hours}時間${remainingMinutes}分`
	}

	return (
		<Select defaultValue={defaultValue.toString()} onValueChange={onChange}>
			<SelectTrigger>
				<SelectValue placeholder="Select a duration" />
			</SelectTrigger>
			<SelectContent>
				{[30, 60, 90, 120, 150, 180].map(duration => {
					const label = duration.toString()
					return (
						<SelectItem value={label} key={label}>
							{formatDuration(duration)}
						</SelectItem>
					)
				})}
			</SelectContent>
		</Select>
	)
}
