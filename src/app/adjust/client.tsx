"use client"

import { useState } from "react"
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
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { ExcludePeriod } from "@/lib/scheduling"
import { User } from "@prisma/client"
import { formatDuration } from "@/lib/utils"
import Candidate from "./candidate"
import { Course } from "@/lib/twinte-parser-type"
import ImportFileButton from "@/components/ImportFileButton"
import { Session } from "next-auth"

// const people = [
// 	{ id: 1, name: "HosokawaR", mail: "superkoyomi1@gmail.com" },
// 	{ id: 2, name: "Sakana", mail: "superkoyomi2@gmail.com" },
// 	{ id: 3, name: "Licht", mail: "superkoyomi3@gmail.com" },
// 	{ id: 4, name: "uxiun", mail: "superkoyomi4@gmail.com" },
// 	{ id: 5, name: "なぐ", mail: "superkoyomi5@gmail.com" },
// 	{ id: 6, name: "しゅんたろう", mail: "hiromichiosato@gmail.com" },
// ]

export default function SchedulePlanner({ session, users }: { session?: Session; users: User[] }) {
	const [title, setTitle] = useState("")
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
	const [selectedDurationMinute, setSelectedDurationMinute] = useState<number>(60)
	const [excludePeriod, setExcludePeriod] = useState<ExcludePeriod>({ start: 22, end: 8 })
	const [courses, setCourses] = useState<Course[]>([])

	return (
		<div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
			<h1 className="text-2xl font-bold mb-4">日程調整</h1>
			<div className="space-y-4">
				<div>
					<Label htmlFor="title">予定のタイトル</Label>
					<Input
						autoFocus
						id="title"
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder="予定のタイトルを入力"
					/>
				</div>
				<div>
					<Label htmlFor="duration-select">予定の長さ（30分間隔）</Label>
					<SelectDuration defaultValue={60} dispatch={setSelectedDurationMinute} />
				</div>
				<div className="">
					<Label htmlFor="exclusion-select">除外時間帯</Label>
					<div className="flex">
						<Exclusion dispatch={setExcludePeriod} defaultValue={excludePeriod} />
						{session ? (
							<div className="pl-8">
								<ImportFile setCourses={setCourses} />
							</div>
						) : (
							""
						)}
					</div>
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

				{/* <Button onClick={handleSchedule} disabled={!isButtonActive} className="w-full">
          「{title || "-"}」の日時を決定する
        </Button> */}
			</div>
			<Candidate
				excludePeriod={excludePeriod}
				selectedDurationMinute={selectedDurationMinute}
				selectedUserIds={selectedUserIds}
				title={title}
				users={users}
				courses={courses}
			/>
			<ToastContainer />
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

	return (
		<Select defaultValue={defaultValue.toString()} onValueChange={onChange}>
			<SelectTrigger>
				<SelectValue placeholder="Select a duration" />
			</SelectTrigger>
			<SelectContent>
				{Array.from(Array((60 / 30) * 6).keys()) // 60m/h / 30m (step) * 6h (max duration)
					.map(i => {
						const duration = (i + 1) * 30
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

function Exclusion({
	defaultValue,
	dispatch,
}: {
	defaultValue: ExcludePeriod
	dispatch: React.Dispatch<React.SetStateAction<ExcludePeriod>>
}) {
	const onChange = (start: string, end: string) => {
		const n_start = parseInt(start)
		const n_end = parseInt(end)
		dispatch({ start: n_start, end: n_end })
	}

	return (
		<div className="flex items-center">
			<div className="flex row items-center">
				{/* <Label>開始時刻</Label> */}
				<div className="w-20">
					<Select
						defaultValue={defaultValue.start.toString()}
						onValueChange={start => onChange(start, defaultValue.end.toString())}>
						<SelectTrigger>
							<SelectValue placeholder="Select a exclude start" />
						</SelectTrigger>
						<SelectContent>
							{Array.from(Array(24).keys()) //24時間から選択
								.map(i => {
									const label = i.toString()
									return (
										<SelectItem value={label} key={label}>
											{i}時
										</SelectItem>
									)
								})}
						</SelectContent>
					</Select>
				</div>
				{/* <Label>終了時刻</Label> */}
				<span className="px-2">～</span>
				<div className="w-20">
					<Select
						defaultValue={defaultValue.end.toString()}
						onValueChange={end => onChange(defaultValue.start.toString(), end)}>
						<SelectTrigger>
							<SelectValue placeholder="Select a exclude end" />
						</SelectTrigger>
						<SelectContent>
							{Array.from(Array(24).keys()) //24時間から選択
								.map(i => {
									const label = i.toString()
									return (
										<SelectItem value={label} key={label}>
											{i}時
										</SelectItem>
									)
								})}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	)
}

type Prop = {
	setCourses: React.Dispatch<Course[]>
}

function ImportFile(prop: Prop) {
	return <ImportFileButton {...prop} />
}
