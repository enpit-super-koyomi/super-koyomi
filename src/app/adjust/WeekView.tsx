"use client"

import React from "react"
import {
	ExcludePeriodState,
	formatTime,
	getEventPosition,
	periodsGroupByDate,
} from "../../lib/draft/utils"
import { Period } from "@/lib/scheduling"
import { setTimes } from "@/lib/utils"

interface WeekViewProps {
	periods: Period[] //空き時間の長さ
	currentDate: Date //今日の日付
	handlePeriodClick: (period: Period) => Promise<void> //予定候補ボタンがクリックされたらカレンダーに予定を追加
	isButtonActive: boolean
	excludePeriodState: ExcludePeriodState
}

export function WeekView({
	periods,
	currentDate,
	handlePeriodClick,
	isButtonActive,
	excludePeriodState,
}: WeekViewProps) {
	const hours = Array.from({ length: 24 }, (_, i) => i)
	const weekDates = Array.from(Array(7).keys()).map(i => {
		const date = new Date(currentDate)
		date.setDate(currentDate.getDate() + i)
		return date
	})
	const periodsPerDate = Array.from(periodsGroupByDate(periods).entries())

	// 0, 1, ...24時間から除外時間を含まない時間を抽出
	const excludePeriod = excludePeriodState.calendar
	const activeHours = hours.filter(i =>
		excludePeriod.start <= excludePeriod.end
			? i <= excludePeriod.start || excludePeriod.end <= i
			: excludePeriod.end <= i && i <= excludePeriod.start
	)

	console.log("periodsPerDate", periodsPerDate)

	// calendarの高さ そのまま分に対応する
	const heightPx = 60 * activeHours.length

	return (
		<div className="max-w-full overflow-x-auto">
			{
				//<div className="min-w-[800px]"> //横幅
			}
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
			<div
				className="relative grid grid-cols-8 gap-px bg-gray-200"
				style={{ height: `${heightPx}px` }}>
				<div className="sticky left-0 bg-white ">
					{activeHours.map(hour => (
						//左側の、1時間ごとの区切りの表示
						<div
							key={hour}
							className="h-[60px] border-t border-gray-200 text-xs text-gray-500 text-right pr-2">
							{`${hour}:00`}
						</div>
					))}
				</div>
				{weekDates.map((date, i) => (
					//曜日の表示
					<div key={date.toDateString()} className="relative bg-white">
						{(i => {
							const [epoch, periods] = periodsPerDate[i] // epoch

							return periods.map(period => {
								const { top, height } = getEventPosition(period, excludePeriodState) // ボタンの上辺と高さを決定
								const start = period.start ? formatTime(period.start) : "…"
								const end = period.end ? formatTime(period.end) : "…"
								return (
									<button
										key={(period.start ?? period.end ?? epoch).toString()}
										disabled={!isButtonActive}
										className={`absolute w-full px-1 py-1 text-xs border rounded overflow-hidden transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
										style={{
											top: `${(top / heightPx) * 100}%`,
											height: `${(height / heightPx) * 100}%`,
											minHeight: "20px",
											backgroundColor: `#f0be5c`, //薄い黄色　縁の中の色
											borderColor: "#f0be5c", //薄い黄色　縁の色
											color: "black", //文字色
										}}
										onClick={() => {
											//空き時間をクリックしたら予定を追加
											const start = period.start ?? new Date(epoch)
											return handlePeriodClick({
												start,
												end: period.end ?? setTimes(start)(24),
											})
										}}>
										<div>
											{start} {end}
										</div>
									</button>
								)
							})
						})(i)}
					</div>
				))}
			</div>
			{
				//</div>
			}
		</div>
	)
}
