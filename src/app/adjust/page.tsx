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

import { Clock } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as React from "react"

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

  export default function Component() {
    const [selectedDuration, setSelectedDuration] = React.useState<string>("0")
    const [currentTime, setCurrentTime] = React.useState(new Date())
  

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

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return "0分"
    if (minutes < 60) return `${minutes}分`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours}時間`
    return `${hours}時間${remainingMinutes}分`
  }

  const generateDurationOptions = React.useCallback(() => {
    const options = []
    for (let minutes = 0; minutes <= 180; minutes += 30) {
      options.push({
        value: minutes.toString(),
        label: formatDuration(minutes)
      })
    }
    return options
  }, [])

  const durationOptions = React.useMemo(generateDurationOptions, [generateDurationOptions])

  React.useEffect(() => {
    // Update current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(intervalId)
  }, [])

  const getSelectedTime = (durationMinutes: number) => {
    const selectedTime = new Date(currentTime.getTime() + durationMinutes * 60000)
    return selectedTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false })
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

      <Label htmlFor="duration-select">時間の長さを選択（30分間隔）</Label>
      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
        <SelectTrigger id="duration-select" className="w-full">
          <SelectValue placeholder="時間の長さを選択してください">
            {selectedDuration && (
              <span className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {formatDuration(parseInt(selectedDuration))}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {durationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedDuration && (
        <p className="text-sm text-muted-foreground">
          選択された時間: {formatDuration(parseInt(selectedDuration))} 
          （{getSelectedTime(parseInt(selectedDuration))}）
        </p>
      )}

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
}
