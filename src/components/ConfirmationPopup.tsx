"use client"

import React, { ChangeEvent, useCallback, useEffect, useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Period } from "@/lib/scheduling"
import { setTimes } from "@/lib/utils"

type ConfirmationPopupProps = {
	isOpen: boolean
	onClose: () => void
	onConfirm: (period: Period) => void
	initialPeriod: Period
  range: Period|null
  initialDurationMinutes: number
}

/**
 * 確認Popup
 * @param range 選択可能な期間
 * @returns 確認Popup component
 */
export function ConfirmationPopup({
	isOpen,
	onClose,
	onConfirm,
	initialPeriod,
  initialDurationMinutes,
  range,
}: ConfirmationPopupProps) {
	// console.log("initialPeriod@ConfirmationPopup", initialPeriod)
  const [period, setPeriod] = useState(initialPeriod)
  // const [period, setPeriod] = useState(initialPeriod)
  const [startTime, setStartTime] = useState(initialPeriod.start.toTimeString().slice(0, 5))
  const [endTime, setEndTime] = useState(initialPeriod.end.toTimeString().slice(0, 5))
  const [durationMinutes, setDurationMinutes] = useState(initialDurationMinutes)
  const [lastChanged, setLastChanged] = useState<keyof Period>("start")

  useEffect(() => {
    setLastChanged("start")
  }, [])

  useEffect(() => {
    setPeriod({...initialPeriod})
  }, [initialPeriod])

  // 一度 cancel して ConfirmationPopup を閉じたら長さも初期化したいが、こうしてもうまく行かない
  useEffect(() => {
    setDurationMinutes(initialDurationMinutes)
  }, [initialDurationMinutes])

  // WeekViewでの更新を伝えるのに必要らしい
  useEffect(() => {
    setStartTime(initialPeriod.start.toTimeString().slice(0, 5))
    setEndTime(initialPeriod.end.toTimeString().slice(0, 5))
  }, [initialPeriod])

  // period変更 を表示に反映
  useEffect(() => {
    setStartTime(period.start.toTimeString().slice(0, 5))
    setEndTime(period.end.toTimeString().slice(0, 5))
  }, [period])

  // 開始時刻変更を period に反映
  useEffect(() => {
    // console.log(startTime, endTime)
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const start = setTimes(period.start)(startHours, startMinutes)
    const p = getFixedLengthPeriod(period, {start})
    setPeriod(p)
  }, [startTime])

  // 終了時刻変更を period に反映
  useEffect(() => {
    // console.log(endTime, endTime)
    const [endHours, endMinutes] = endTime.split(":").map(Number)
    const end = setTimes(period.end)(endHours, endMinutes)
    const p = getFixedLengthPeriod(period, {end})
    setPeriod(p)
  }, [endTime])

  // 長さの変更を period に反映
  useEffect(() => {
    const change = new Date(period[lastChanged])
    change.setMinutes(change.getMinutes() + (
      lastChanged == "start" ? durationMinutes : (0 - durationMinutes)
    ))

    const notLastChanged = lastChanged == "start" ? "end" : "start"

    console.log("lastChanged", lastChanged)
    setPeriod(p => ({...p, [notLastChanged]: change}))
  }, [durationMinutes])

  const handleChangeTime = (changed: keyof Period) => (e: ChangeEvent<HTMLInputElement>) => {
    setLastChanged(changed)
    if (changed == "start") setStartTime(e.target.value)
    else setEndTime(e.target.value)
  }

  // todo: validation した結果を form に反映。開始時刻がはみ出ているなら、その input を赤線で縁取ってその下に注記するなど

  // 範囲内に収まっているか
  const isOutOfRange = (period: Period) =>
    range ? (
      period.start < range.start ||
      period.end > range.end
    ) : true

  const getFixedLengthPeriod = useCallback((basePeriod: Period, period: Partial<Period>): Period => {
    if (period.start) {
      const end = new Date(period.start)
      end.setMinutes(end.getMinutes() + durationMinutes)
      return ({...basePeriod, end})
    }
    else if (period.end) {
      const start = new Date(period.end)
      start.setMinutes(start.getMinutes() - durationMinutes)
      return ({...basePeriod, start})
    }
    return basePeriod

  }, [durationMinutes])


	const handleConfirm = () => {
		onConfirm(period)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm Time Selection</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="start-time" className="text-right">
							Start Time
						</Label>
						<Input
							id="start-time"
							type="time"
							value={startTime}
							onChange={handleChangeTime("start")}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="end-time" className="text-right">
							End Time
						</Label>
						<Input
							id="end-time"
							type="time"
							value={endTime}
							onChange={handleChangeTime("end")}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="duration-minutes" className="text-right">
							Duration
						</Label>
						<Input
							id="duration-minutes"
							type="number"
							value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
							className="col-span-3"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={onClose} variant="outline">
						Cancel
					</Button>
					<Button
            onClick={handleConfirm}
            disabled={isOutOfRange(period)} >Confirm</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
