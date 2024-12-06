"use client"

import React from 'react';
import { formatTime, getEventPosition } from '../../lib/draft/utils';
import { Period } from '@/lib/scheduling';

interface WeekViewProps {
  periods: Period[]; //空き時間の長さ
  currentDate: Date; //今日の日付
  handlePeriodClick: (period: Period) => Promise<void> //予定候補ボタンがクリックされたらカレンダーに予定を追加
  isButtonActive: boolean
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
            {hours.map((hour) => (//左側の、1時間ごとの区切りの表示？
              <div key={hour} className="h-[60px] border-t border-gray-200 text-xs text-gray-500 text-right pr-2">
                {`${hour}:00`}
              </div>
            ))}
          </div>
          {weekDates.map((date) => ( //曜日の表示？
            <div key={date.toISOString()} className="relative bg-white">
              {periods
                .filter((period) => period.start.toDateString() === date.toDateString()) //予定の開始時刻と"date"が同じperiodをフィルターする
                .map((period) => {//配列の各要素に対して処理
                  const { top, height } = getEventPosition(period); //periodを元に、ボタンの上辺と高さを決定
                  return (
                    <button //予定候補をボタンとしている
                      key={period.start.toString()}
                      disabled={!isButtonActive}
                      className={`absolute w-full px-1 py-1 text-xs border rounded overflow-hidden transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        minHeight: '20px',
                        backgroundColor: `#f0be5c`,//薄い黄色　縁の中の色
                        borderColor: "#f0be5c",//薄い黄色　縁の色
                        color: "black", //文字色
                      }}
                      onClick={() => handlePeriodClick(period)} //空き時間をクリックしたら予定を追加
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

