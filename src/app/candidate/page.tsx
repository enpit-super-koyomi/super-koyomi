"use client";

import React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeSlot {
  start: string;
  end: string;
  note: string;
}

interface DaySchedule {
  date: Date;
  timeSlots: TimeSlot[];
}

const scheduleData: DaySchedule[] = [
  {
    date: new Date(2024, 8, 26), // 2024年9月26日
    timeSlots: [
      { start: "10:00", end: "12:00", note: "前の時間が押すかもしれません" },
      { start: "14:00", end: "16:00", note: "" },
    ],
  },
  {
    date: new Date(2024, 8, 27), // 2024年9月27日
    timeSlots: [
      { start: "09:00", end: "11:00", note: "" },
      { start: "13:00", end: "15:00", note: "" },
      { start: "16:00", end: "18:00", note: "" },
    ],
  },
];

export default function ScheduleTable() {
  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    const durationInMinutes =
      endHour * 60 + endMinute - (startHour * 60 + startMinute);
    return `${Math.floor(durationInMinutes / 60)}:${(durationInMinutes % 60).toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto p-4">
      細川
      {scheduleData.map((day) => (
        <Card key={day.date.toISOString()} className="mb-6">
          <CardHeader>
            <CardTitle>
              {format(day.date, "yyyy/M/d (E)", { locale: ja })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">時間</TableHead>
                    <TableHead className="w-1/3">期間</TableHead>
                    <TableHead className="w-1/3">メモ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {day.timeSlots.map((slot) => (
                    <TableRow key={`${slot.start}-${slot.end}`}>
                      <TableCell className="text-left whitespace-nowrap">
                        {slot.start} - {slot.end}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {calculateDuration(slot.start, slot.end)}
                      </TableCell>
                      <TableCell>
                        <span className="block truncate" title={slot.note}>
                          {slot.note}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
