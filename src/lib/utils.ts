import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ExcludePeriod, Period } from "./scheduling"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const generateRandomDate = () => {
	const now = new Date()
	const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
	const randomTime = new Date(
		now.getTime() + Math.random() * (oneWeekLater.getTime() - now.getTime())
	)
	return randomTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}

export const dateToGCalFormat = (date: Date): string =>
	date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

export const truncateTime = (date: Date): Date =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const excludePeriodOfOffsetDays = (
	excludePeriod: ExcludePeriod,
	offsetDays?: number,
	baseDate?: Date
): Period => {
	const endOffsetDaysAdd = excludePeriod.start <= excludePeriod.end ? 0 : 1
	const start = baseDate == undefined ? new Date() : truncateTime(baseDate)
	const end = baseDate == undefined ? new Date() : truncateTime(baseDate)
	start.setUTCHours(excludePeriod.start)
	end.setUTCHours(excludePeriod.end)
	start.setUTCDate(start.getUTCDate() + (offsetDays ?? 0))
	end.setUTCDate(end.getUTCDate() + (offsetDays ?? 0) + endOffsetDaysAdd)
	return {
		start: shiftDateByTimezoneOffsetJST(start),
		end: shiftDateByTimezoneOffsetJST(end)
	}
}

export const shiftDateByTimezoneOffset = (offsetMinutes?: number) => (date: Date): Date => {
	const offset = offsetMinutes ?? date.getTimezoneOffset()
	date.setUTCMinutes(date.getUTCMinutes() + offset)
	return date
}

export const shiftDateByTimezoneOffsetJST = shiftDateByTimezoneOffset(-540);

export const formatDuration = (minutes: number) => {
	if (minutes === 0) return "0分"
	if (minutes < 60) return `${minutes}分`
	const hours = Math.floor(minutes / 60)
	const remainingMinutes = minutes % 60
	if (remainingMinutes === 0) return `${hours}時間`
	return `${hours}時間${remainingMinutes}分`
}

export const formatDate = (date: Date): string => {
	// Convert to a user-friendly string
	const formattedDate = date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long', // 'short' for abbreviated month names
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
    // timeZoneName: 'short' // Shows the time zone
	});

	return formattedDate
}