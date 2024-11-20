import { Button } from "@/components/ui/button"
import { ExcludePeriod, Period, findFreePeriods, periodsOfUsers } from "@/lib/scheduling"
import { formatDate } from "@/lib/utils"
import { User } from "@prisma/client"
import { useEffect, useState } from "react"

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
  const [selectedPeriod, setSelectedPeriod] = useState<Period|null>(null)

	useEffect(() => {
		setIsButtonActive(props.title.trim() !== "")
	}, [props.title])

	async function handleSchedule() {
		setIsButtonActive(false)
		try {
			const periods = await periodsOfUsers(props.selectedUserIds, props.excludePeriod)

			const freePeriods = await findFreePeriods(props.selectedDurationMinute, periods)

			setFreePeriods(freePeriods)
		} catch (e) {
			window.alert("Sorry, an error has occurred!")
			console.error(e)
		} finally {
			setIsButtonActive(true)
		}
	}

  async function handlePeriodClick(period: Period) {
    setSelectedPeriod(period)
  }

	return (
		<div className="py-4">
			<Button onClick={handleSchedule} disabled={!isButtonActive} className="w-full">
				「{props.title || "-"}」の日時候補を探す
			</Button>
			<ul className="py-4 space-y-2">
				{freePeriods.map(period => (
					<li key={period.start.toString()}
            >
						<Button
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
