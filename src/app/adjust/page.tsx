"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const people = [
  { id: 1, name: "田中太郎" },
  { id: 2, name: "佐藤花子" },
  { id: 3, name: "鈴木一郎" },
  { id: 4, name: "山田優子" },
]

export default function SchedulePlanner() {
  const [title, setTitle] = useState("")
  const [selectedPeople, setSelectedPeople] = useState<number[]>([])
  const [isButtonActive, setIsButtonActive] = useState(false)

  useEffect(() => {
    setIsButtonActive(title.trim() !== "" && selectedPeople.length > 0)
  }, [title, selectedPeople])

  const generateRandomDate = () => {
    const now = new Date()
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const randomTime = new Date(now.getTime() + Math.random() * (oneWeekLater.getTime() - now.getTime()))
    return randomTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const handleSchedule = () => {
    const date = generateRandomDate()
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date}/${date}`
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
          調整する
        </Button>
      </div>
    </div>
  )
}