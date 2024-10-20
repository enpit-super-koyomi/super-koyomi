"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { dateToGCalFormat } from '@/lib/utils'
import { Period, schedule } from '@/lib/scheduling'
import { getHostEvents } from '@/lib/getEvents'
import { CalEvent } from '@/logic/calendar'

const people = [
  { id: 1, name: "HosokawaR", mail: "superkoyomi1@gmail.com" },
  { id: 2, name: "Sakana", mail: "superkoyomi2@gmail.com"  },
  { id: 3, name: "Licht", mail: "superkoyomi3@gmail.com"  },
  { id: 4, name: "uxiun", mail: "superkoyomi4@gmail.com"  },
  { id: 5, name: "なぐ", mail: "superkoyomi5@gmail.com"  },
  { id: 6, name: "しゅんたろう", mail: "hiromichiosato@gmail.com"  }
]

export default function SchedulePlanner() {
  const [title, setTitle] = useState("")
  const [selectedPeople, setSelectedPeople] = useState<number[]>([])
  const [isButtonActive, setIsButtonActive] = useState(false)

  useEffect(() => {
    setIsButtonActive(title.trim() !== "" && selectedPeople.length > 0)
  }, [title, selectedPeople])

  async function findPeriod()  {
    // const mails = selectedPeople.map(id => people.find(p => p.id === id))
    const hostEvents = await getHostEvents()
    const guestsEvents: CalEvent[][] = []
    const periodsByUser: Period[][] = [...guestsEvents, (hostEvents ?? [])]
      .map(events =>
        events.map(({start, end}) => ({ start, end }))
      )

    const foundPeriod = schedule(periodsByUser)

    // const oktime = freetimes.find(time => {
    //   const dif_hour = (time.end.getTime() - time.start.getTime()) / (60*60*1000)
    //   return dif_hour >= 1
    // })

    return foundPeriod
  }

  async function handleSchedule () {
    const period = await findPeriod()
    const date_s = dateToGCalFormat(period?.start ?? new Date())
    const date_f = dateToGCalFormat(period?.end ?? new Date())
    const selectedGuests = people
      .filter(person => selectedPeople.includes(person.id))
      .map(person => person.mail)
      .join(",")
    const retry_URL = `https://app.superkoyomi.org/retry/test_id?title=${encodeURIComponent(title)}&selectedGuest=${selectedGuests}`
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date_s}/${date_f}&add=${selectedGuests}&details=${encodeURIComponent(retry_URL)}`
    window.open(calendarUrl, '_blank')
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
            onChange={(e) => setTitle(e.target.value)}
            placeholder="予定のタイトルを入力"
          />
        </div>
        <div>
          <Label>招待する人</Label>
          <div className="mt-2 space-y-2">
            {people.map((person) => (
              <div key={person.id} className="flex items-center">
                <Checkbox
                  id={`person-${person.id}`}
                  checked={selectedPeople.includes(person.id)}
                  onCheckedChange={(checked) => {
                    setSelectedPeople(
                      checked
                        ? [...selectedPeople, person.id]
                        : selectedPeople.filter((id) => id !== person.id)
                    )
                  }}
                />
                <Label htmlFor={`person-${person.id}`} className="ml-2">
                  {person.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <Button
          onClick={handleSchedule}
          disabled={!isButtonActive}
          className="w-full"
        >
          「{title || "-"}」の日時を決定する
        </Button>
      </div>
    </div>
  )
}
