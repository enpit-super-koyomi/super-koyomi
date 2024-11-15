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
	start.setHours(excludePeriod.start)
	end.setHours(excludePeriod.end)
	start.setDate(start.getDate() + (offsetDays ?? 0))
	end.setDate(end.getDate() + (offsetDays ?? 0) + endOffsetDaysAdd)
	return { start, end }
}

export const formatDuration = (minutes: number) => {
	if (minutes === 0) return "0分"
	if (minutes < 60) return `${minutes}分`
	const hours = Math.floor(minutes / 60)
	const remainingMinutes = minutes % 60
	if (remainingMinutes === 0) return `${hours}時間`
	return `${hours}時間${remainingMinutes}分`
}
