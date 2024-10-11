"use client"
import { Button } from '@/components/ui/button'
import { generateRandomDate } from '@/lib/utils'
import { useRouter } from 'next/router'

export default function RetryPage({
	params,
	searchParams
}: {
	params: { id: string }
	searchParams: { current: string|undefined, title: string, selectedGuests: string }
}) {
	// const ds = searchParams.current.split("/")
	// const datetimes = ds.map(parseParameterDate)

	return <div className='flex flex-col max-w-120 items-center'>
		<h2 className='text-2xl'>予定「{searchParams.title}」を再調整する</h2>
		<Button onClick={() => retry(searchParams.title, searchParams.selectedGuests)}>Retry</Button>
	</div>
}

// const parseParameterDate = (date: string): Date {
// 	const s = date.split("T")
// 	const year = s[0].slice(0,4)
// 	const month = s[0].slice(4,6)
// 	const day = s[0].slice(6, 8)
// 	const hour = s[1].slice(0,2)
// 	const min = s[1].slice(2,4)
// 	const sec = s[1].slice(4,6)
// 	return new Date(year, month,)
// }

const retry = (title: string, selectedGuests: string) => {
	const date = generateRandomDate()
	const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date}/${date}&add=${selectedGuests}`
	 window.open(calendarUrl, '_blank')
}