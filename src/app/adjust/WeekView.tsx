"use client"

import React, { useEffect, useState } from 'react';
import { ExcludePeriodState, formatTime, getEventPosition, toCrossPeriods } from '../../lib/draft/utils';
import { ExcludePeriod, Period } from '@/lib/scheduling';
import { Eclipse } from 'lucide-react';
import { setTimes } from '@/lib/utils';

interface WeekViewProps {
  periods: Period[];
  currentDate: Date;
  handlePeriodClick: (period: Period) => Promise<void>
  isButtonActive: boolean
  excludePeriodState: ExcludePeriodState,
}

export function WeekView({ periods, currentDate, handlePeriodClick, isButtonActive, excludePeriodState }: WeekViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const weekDates = Array.from(Array(7).keys()).map(i => {
    const date = new Date(currentDate)
    date.setDate(currentDate.getDate() + i)
    return date
  })
  const crossPeriods = toCrossPeriods(periods)

  const excludePeriod = excludePeriodState.calendar
  // 0, 1, ...24時間から除外時間を含まない時間を抽出
  const activeHours = hours
    .filter(i => (excludePeriod.start <= excludePeriod.end)
      ? (i <= excludePeriod.start || excludePeriod.end <= i)
      : (excludePeriod.end <= i && i <= excludePeriod.start)
    )

  console.log("crossPeriods", crossPeriods)

  // calendarの高さ そのまま分に対応する
  const heightPx = 60 * activeHours.length

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
        <div className="relative grid grid-cols-8 gap-px bg-gray-200" style={{ height: `${heightPx}px` }}>
          <div className="sticky left-0 bg-white ">
            {activeHours.map((hour) => (
              <div key={hour} className="h-[60px] border-t border-gray-200 text-xs text-gray-500 text-right pr-2">
                {`${hour}:00`}
              </div>
            ))}
          </div>
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="relative bg-white">
              {crossPeriods
                .filter(period => (period.crossOpen == "start" ? period.end : period.start).toDateString() === date.toDateString())
                .map(period => {
                  const { top, height } = getEventPosition(period, excludePeriodState);
                  const start = period.crossOpen == "start" ? "…" : formatTime(period.start)
                  const end = period.crossOpen == "end" ? "…" : formatTime(period.end)
                  return (
                    <button
                      key={(period.start??period.end).toString()}
                      disabled={!isButtonActive}
                      className={`absolute w-full px-1 py-1 text-xs border rounded overflow-hidden transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                      style={{
                        top: `${top/heightPx*100}%`,
                        height: `${height/heightPx*100}%`,
                        minHeight: '20px',
                        backgroundColor: `#f0be5c`,//lightsteelblue#b0c4de
                        borderColor: "#f0be5c",//lightsteelblue
                        color: "black",
                      }}
                      onClick={() => handlePeriodClick(period)}
                    >
                      <div>{start}  {end}</div>
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

