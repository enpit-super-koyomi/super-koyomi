import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
