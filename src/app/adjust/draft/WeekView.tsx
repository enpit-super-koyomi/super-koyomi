import React, { useState } from 'react';
import { EditableCalendarEvent } from './types';
import { getWeekDates, formatTime, getEventPosition } from './utils';
import { EventModal } from './EventModal';

interface WeekViewProps {
  events: EditableCalendarEvent[];
  currentDate: Date;
}

export function WeekView({ events, currentDate }: WeekViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<EditableCalendarEvent | null>(null);
  const weekDates = getWeekDates(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleEventClick = (event: EditableCalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="sticky left-0 bg-white z-10"></div>
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="text-center py-2 font-semibold bg-white">
              {date.toLocaleDateString('ja-JP', { weekday: 'short', month: 'numeric', day: 'numeric' })}
            </div>
          ))}
        </div>
        <div className="relative grid grid-cols-8 gap-px bg-gray-200" style={{ height: '1440px' }}>
          <div className="sticky left-0 bg-white z-10">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] border-t border-gray-200 text-xs text-gray-500 text-right pr-2">
                {`${hour}:00`}
              </div>
            ))}
          </div>
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="relative bg-white">
              {events
                .filter((event) => event.start.toDateString() === date.toDateString())
                .map((event) => {
                  const { top, height } = getEventPosition(event);
                  return (
                    <button
                      key={event.id}
                      className={`absolute w-full px-1 py-1 text-xs border rounded overflow-hidden transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                      style={{ 
                        top: `${top}%`, 
                        height: `${height}%`, 
                        minHeight: '20px',
                        backgroundColor: `${event.color}20`,
                        borderColor: event.color,
                        color: event.color,
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-semibold">{event.title}</div>
                      <div>{formatTime(event.start)} - {formatTime(event.end)}</div>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={handleCloseModal}
      />
    </div>
  );
}

