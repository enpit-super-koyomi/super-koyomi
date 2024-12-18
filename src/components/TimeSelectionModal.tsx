import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HoursMinutes,
  formatHoursMinutes,
  normalizeTime,
  roundTime,
  sortTimeFunction,
} from "@/lib/draft/utils";

type TimeSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectTime: (time: HoursMinutes) => void;
  date: Date;
  position: { x: number; y: number } | null;
  clickedTime: { hours: number; minutes: number } | null;
  roundMinutes?: number;
};

export function TimeSelectionModal({
  isOpen,
  onClose,
  onSelectTime,
  position,
  clickedTime,
  roundMinutes,
}: TimeSelectionModalProps) {
  const time = roundTime(
    clickedTime ?? {
      hours: 12,
      minutes: 0,
    },
    roundMinutes,
  );
  const r = roundMinutes ?? 5;
  const timeSlots = Array.from({ length: 4 }, (_, i): HoursMinutes[] => {
    const slots = [
      {
        hours: time.hours,
        minutes: time.minutes + i * r,
      },
    ];

    if (i != 0)
      slots.push({
        hours: time.hours,
        minutes: time.minutes - i * r,
      });

    return slots;
  })
    .flatMap((a) => a)
    .toSorted(sortTimeFunction)
    .map(normalizeTime);

  // const timeSlots1 = Array.from({ length: 48 }, (_, i) => {
  //   const hours = Math.floor(i / 2)
  //   const minutes = i % 2 === 0 ? '00' : '30'
  //   return `${hours.toString().padStart(2, '0')}:${minutes}`
  // })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        style={{
          position: "absolute",
          left: position ? `${position.x}px` : "50%",
          top: position ? `${position.y}px` : "50%",
          transform: position
            ? "translate(-50%, -50%)"
            : "translate(-50%, -50%)",
        }}
      >
        <DialogHeader>
          <DialogTitle>Select Start Time</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
          {timeSlots.map((time) => (
            <Button
              key={formatHoursMinutes(time)}
              onClick={() => onSelectTime(time)}
              variant="outline"
            >
              {formatHoursMinutes(time)}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
