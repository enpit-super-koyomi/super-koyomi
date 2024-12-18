import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ConfirmationPopupProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (startTime: Date, endTime: Date) => void
  initialStartTime: Date
  initialEndTime: Date
}

export function ConfirmationPopup({ isOpen, onClose, onConfirm, initialStartTime, initialEndTime }: ConfirmationPopupProps) {
  const [startTime, setStartTime] = useState(initialStartTime.toTimeString().slice(0, 5))
  const [endTime, setEndTime] = useState(initialEndTime.toTimeString().slice(0, 5))

  const handleConfirm = () => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)

    const newStartTime = new Date(initialStartTime)
    newStartTime.setHours(startHours, startMinutes)

    const newEndTime = new Date(initialEndTime)
    newEndTime.setHours(endHours, endMinutes)

    onConfirm(newStartTime, newEndTime)
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
              onChange={(e) => setStartTime(e.target.value)}
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
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

