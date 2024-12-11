"use client"

import React from 'react';
import { formatTime, getEventPosition } from '../../lib/draft/utils';
import { Period } from '@/lib/scheduling';
import { Course } from 'twinte-parser';

interface WeekViewProps {
  periods: Period[];
  currentDate: Date;
  handlePeriodClick: (period: Period) => Promise<void>
  isButtonActive: boolean
  courses: Course[]
}

export function WeekView({ periods, currentDate, handlePeriodClick, isButtonActive }: WeekViewProps) {
  const weekDates = Array.from(Array(7).keys()).map(i => {
    const date = new Date(currentDate)
    date.setDate(currentDate.getDate() + i)
    return date
  })
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="max-w-full overflow-x-auto">
      {
      //<div className="min-w-[800px]"> //横幅
}
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="sticky left-0 bg-white "></div>
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="text-center text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl py-2 font-semibold bg-white">
              {date.toLocaleDateString('ja-JP', { weekday: 'short', month: 'numeric', day: 'numeric' })}
            </div>
          ))}
        </div>
        <div className="relative grid grid-cols-8 gap-px bg-gray-200" style={{ height: '1440px' }}>
          <div className="sticky left-0 bg-white ">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] border-t border-gray-200 text-xs text-gray-500 text-right pr-2">
                {`${hour}:00`}
              </div>
            ))}
          </div>
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="relative bg-white">
              {periods
                .filter((period) => period.start.toDateString() === date.toDateString())
                .map((period) => {
                  const { top, height } = getEventPosition(period);
                  return (
                    <button
                      key={period.start.toString()}
                      disabled={!isButtonActive}
                      className={`absolute w-full px-1 py-1 text-xs border rounded overflow-hidden transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        minHeight: '20px',
                        backgroundColor: `#f0be5c`,//lightsteelblue#b0c4de
                        borderColor: "#f0be5c",//lightsteelblue
                        color: "black",
                      }}
                      onClick={() => handlePeriodClick(period)}
                    >
                      <div>{formatTime(period.start)}  {formatTime(period.end)}</div>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      {
      //</div>
}
    </div>
  );
}

