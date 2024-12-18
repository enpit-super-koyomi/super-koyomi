import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type TimeSelectionModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelectTime: (time: string) => void
  date: Date
  position: { x: number; y: number } | null
}

export function TimeSelectionModal({ isOpen, onClose, onSelectTime, date, position }: TimeSelectionModalProps) {
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2)
    const minutes = i % 2 === 0 ? '00' : '30'
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        style={{
          position: 'absolute',
          left: position ? `${position.x}px` : '50%',
          top: position ? `${position.y}px` : '50%',
          transform: position ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
        }}
      >
        <DialogHeader>
          <DialogTitle>Select Start Time</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
          {timeSlots.map((time) => (
            <Button
              key={time}
              onClick={() => onSelectTime(time)}
              variant="outline"
            >
              {time}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

