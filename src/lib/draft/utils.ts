import { ExcludePeriod, Period } from "@/lib/scheduling"
import { max, setTimes, truncateTime } from "../utils"

export function getWeekDates(date: Date): Date[] {
	const week = []
	const current = new Date(date)
	current.setDate(current.getDate() - current.getDay())
	for (let i = 0; i < 7; i++) {
		week.push(new Date(current))
		current.setDate(current.getDate() + 1)
	}
	return week
}

export function formatTime(date: Date): string {
	return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
}

export type ExcludePeriodState = {
	calculated?: ExcludePeriod
	calendar: ExcludePeriod
}

export function getEventPosition(
	period: CrossPeriod,
	excludePeriodState: ExcludePeriodState
): { top: number; height: number } {
	const start =
		period.crossOpen == "start" ? 0 : period.start.getHours() * 60 + period.start.getMinutes()
	const end =
		period.crossOpen == "end" ? 24 * 60 : period.end.getHours() * 60 + period.end.getMinutes()
	const excludePeriod = excludePeriodState.calendar
	const excludeDurationHours =
		excludePeriod.start <= excludePeriod.end
			? excludePeriod.end - excludePeriod.start
			: 24 + excludePeriod.end - excludePeriod.start

	const offsetHours =
		excludePeriod.start <= excludePeriod.end // 除外時間帯が日付を跨がないとき
			? (period.crossOpen == "start" ? 0 : period.start.getHours()) >= excludePeriod.end
				? 1 - excludeDurationHours // 後ろの予定は除外時間帯の長さだけずらす。除外時間帯は表示上1の長さに圧縮されるので 1足している
				: 0 // 除外時間帯より前の予定はそのまま
			: excludePeriod.end * -1 // 0時から除外時間帯終了までの分を詰める

	const top = start + offsetHours * 60
	const height = end - start

	return { top, height }
}

// 日付をまたぐ期間（丸一日を含む複数日には対応していない）
export type CrossPeriod = Period & {
	crossOpen?: "start" | "end"
}
export const toCrossPeriods = (periods: Period[]): CrossPeriod[] =>
	periods.flatMap(period =>
		period.start.toDateString() != period.end.toDateString()
			? ([
					{ ...period, crossOpen: "start" },
					{ ...period, crossOpen: "end" },
			  ] as CrossPeriod[])
			: [period]
	)

export type MinutesPeriod = {
	start: number
	end: number
}

const minutesToExcludePeriod = (minutePeriod: MinutesPeriod): ExcludePeriod => ({
	start: Math.ceil(minutePeriod.start / 60),
	end: Math.floor(minutePeriod.end / 60),
})

export const fitExcludePeriods = (
	excludePeriod: ExcludePeriod,
	periods: CrossPeriod[]
): Partial<ExcludePeriod>|null => {
	const freeExcludePeriods = findFreeExcludePeriods(excludePeriod, periods)
	console.log(
		"freeExcludePeriods",
		freeExcludePeriods.map(p => minutesToExcludePeriod(p))
	)
	const startSide = freeExcludePeriods.find(k => k.end == 24 * 60)
	const endSide = freeExcludePeriods.find(k => k.start == 0)
	if (startSide && endSide)
		return {
			start: Math.ceil(startSide.start / 60),
			end: Math.floor(endSide.end / 60),
		}
	else {
		freeExcludePeriods.sort((a, b) => b.end - b.start - (a.end - a.start))
		const long = freeExcludePeriods.at(0)
		return long ? minutesToExcludePeriod(long) : null
	}
}

// periods と重なっていない excludePeriod の部分を抽出
export const findFreeExcludePeriods = (
	excludePeriod: ExcludePeriod,
	periods: CrossPeriod[]
): MinutesPeriod[] => {
  console.log("findFreeExcludePeriods, periods", periods)
	const freeBusyChanges: Array<{ timestamp: number; countDelta: 1 | -1; isExclude: boolean }> = []
	const totalMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes()

	for (const event of periods) {
		freeBusyChanges.push({
			timestamp: event.crossOpen == "start" ? 0 : totalMinutes(event.start),
			countDelta: 1,
			isExclude: false,
		})
		freeBusyChanges.push({
			timestamp: event.crossOpen == "end" ? 24 * 60 : totalMinutes(event.end),
			countDelta: -1,
			isExclude: false,
		})
	}

	;(excludePeriod.start <= excludePeriod.end
		? [excludePeriod]
		: [
				{
					start: excludePeriod.start,
					end: 24,
				},
				{
					start: 0,
					end: excludePeriod.end,
				},
		  ]
	).forEach(excludePeriod => {
		freeBusyChanges.push({
			timestamp: excludePeriod.start * 60,
			countDelta: 1,
			isExclude: true,
		})
		freeBusyChanges.push({
			timestamp: excludePeriod.end * 60,
			countDelta: -1,
			isExclude: true,
		})
	})

	freeBusyChanges.sort((a, b) => a.timestamp - b.timestamp)
	console.log("excludePeriod", excludePeriod, "freeBusyChanges", freeBusyChanges)

	const candidate: MinutesPeriod[] = []
	let noOverwrap = {
		start: 0,
		end: 0,
	}
	let busyCount = {
		exclude: 0,
		count: 0,
	}
	for (const change of freeBusyChanges) {
		if (
			busyCount.exclude > 0 &&
			busyCount.count == 0 &&
			change.countDelta == 1 &&
			!change.isExclude
		) {
			noOverwrap.end = change.timestamp
			if (noOverwrap.end - noOverwrap.start > 0) candidate.push({ ...noOverwrap }) // {...}で展開しないと shallow copy（参照複製）になってあとからの noOverwrap の変更が candidate に追加した分にも反映されて値が同じになってしまう
		}

		if (change.isExclude) {
			busyCount.exclude = max(0, busyCount.exclude + change.countDelta)
			if (busyCount.exclude == 0 && busyCount.count == 0) {
				noOverwrap.end = change.timestamp
				if (noOverwrap.end - noOverwrap.start > 0) candidate.push({ ...noOverwrap })
			}
		} else busyCount.count = max(0, busyCount.count + change.countDelta)
		if (
			busyCount.count == 0 &&
			((change.isExclude && busyCount.exclude == 1) || (!change.isExclude && busyCount.exclude > 0))
		)
			noOverwrap.start = change.timestamp

		console.log("change", change, "busyCount", busyCount, "noOverwrap", noOverwrap, "candidate", candidate)
	}

	return candidate
}
