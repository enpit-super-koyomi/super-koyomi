import { ExcludePeriod, Period } from "@/lib/scheduling"
import { max, setTimes } from "../utils"

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
	period: Partial<Period>,
	excludePeriodState: ExcludePeriodState
): { top: number; height: number } {
	const start =
		period.start? (period.start.getHours() * 60 + period.start.getMinutes()): 0
	const end =
		period.end? (period.end.getHours() * 60 + period.end.getMinutes()): 24*60
	const excludePeriod = excludePeriodState.calendar
	const excludeDurationHours =
		excludePeriod.start <= excludePeriod.end
			? excludePeriod.end - excludePeriod.start
			: 24 + excludePeriod.end - excludePeriod.start

	const offsetHours =
		excludePeriod.start <= excludePeriod.end // 除外時間帯が日付を跨がないとき
			? (period.start ? period.start.getHours() : 0) >= excludePeriod.end
				? 1 - excludeDurationHours // 後ろの予定は除外時間帯の長さだけずらす。除外時間帯は表示上1の長さに圧縮されるので 1足している
				: 0 // 除外時間帯より前の予定はそのまま
			: excludePeriod.end * -1 // 0時から除外時間帯終了までの分を詰める

	const top = start + offsetHours * 60
	const height = end - start

	return { top, height }
}

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
	periods: Period[]
): Partial<ExcludePeriod>|null => {
	const freeExcludePeriods = findFreeExcludePeriodsByDate(excludePeriod, periods)
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

// periods を日付を跨がない期間に分割して日付ごとにまとめる
// start, end が日付を跨いでいれば undefined
export const periodsGroupByDate = (periods: Period[]): Map<number, Partial<Period>[]> => {
  const periodsPerDate = new Map()
  const setOrAppend = <K,V>(m: Map<K, V[]>) => (key: K, values: V[]) => {
    const vs = m.get(key)
    m.set(key, [...vs ?? [], ...values])
  }
	const set = setOrAppend(periodsPerDate)
  periods.forEach(period => {
    let start = period.start
		let hasSplitted = false
    while (true) {
      const end = setTimes(start)(24)
      const today = setTimes(start)(0)
      if (end.getTime() < period.end.getTime()) {
        set(today.getTime(), [hasSplitted ? {} : {start}])
        today.setDate(today.getDate() + 1)
        start = today
				hasSplitted = true
      } else {
        set(today.getTime(), [hasSplitted ? { end: period.end } : {...period, start}])
				break
      }
    }
  })

	return periodsPerDate
}

const totalMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes()

// periods と重なっていない excludePeriod の部分を抽出
// 日付ごとに抽出してから、それらの積を取る
export const findFreeExcludePeriodsByDate = (
	excludePeriod: ExcludePeriod,
	periods: Period[]
): MinutesPeriod[] => {
  const grouped = periodsGroupByDate(periods)
	const freeExcludePeriodsPerDate: MinutesPeriod[][] = [] // 日付ごとの除外時間帯上の重なっていない部分

	grouped.forEach((periodsInDay) => {
		const freeBusyChanges: Array<{ timestamp: number; countDelta: 1 | -1; isExclude: boolean }> = []

		for (const event of periodsInDay) {
			freeBusyChanges.push({
				timestamp: event.start ? totalMinutes(event.start) : 0,
				countDelta: 1,
				isExclude: false,
			})
			freeBusyChanges.push({
				timestamp: event.end ? totalMinutes(event.end): 24*60,
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

		const candidate: MinutesPeriod[] = []
		const noOverwrap = {
			start: 0,
			end: 0,
		}
		const busyCount = {
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
		}

		freeExcludePeriodsPerDate.push(candidate)
	})

	console.log("freeExcludePeriodsPerDate", freeExcludePeriodsPerDate)
	// もし重なっていない除外時間帯が見つからない日があれば、空候補を返す
	if (freeExcludePeriodsPerDate.some(exs => exs.length == 0)) return []

	// freeExcludePeriodsPerDate の重なりを数え、全ての日付を通して重なっている部分を抽出
	const candidate : MinutesPeriod[] = []
	const changes = freeExcludePeriodsPerDate.flatMap(es => es.flatMap(e => [
		{ at: e.start, isStart: true },
		{ at: e.end, isStart: false }
	]))
	changes.sort((a, b) => a.at - b.at)

	const period: MinutesPeriod = {
		start: 0,
		end: 0
	}
	let count = 0
	for (const change of changes) {
		if (count == freeExcludePeriodsPerDate.length && !change.isStart) {
			period.end = change.at
			if (period.end - period.start > 0) candidate.push({...period})
		}

		count += change.isStart ? 1 : -1
		if (count == freeExcludePeriodsPerDate.length) period.start = change.at
	}

	return candidate
}
