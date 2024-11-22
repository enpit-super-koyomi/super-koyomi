import React, { useState } from 'react';
import { WeekView } from './WeekView';
import { EditableCalendarEvent } from './types';

const initialEvents: EditableCalendarEvent[] = [
  {
    id: '1',
    title: '朝のミーティング',
    start: new Date('2023-05-15T09:00:00'),
    end: new Date('2023-05-15T10:00:00'),
    color: '#4285F4',
    description: '週の計画を立てる',
    onEdit: () => {},
    onDelete: () => {}
  },
  {
    id: '2',
    title: 'プロジェクトAの進捗確認',
    start: new Date('2023-05-15T11:00:00'),
    end: new Date('2023-05-15T12:30:00'),
    color: '#0F9D58',
    description: 'チームメンバーと進捗を確認',
    onEdit: () => {},
    onDelete: () => {}
  },
  // ... 他の予定も同様に追加
];

export default function Page() {
  const [events, setEvents] = useState<EditableCalendarEvent[]>(initialEvents);

  const handleEditEvent = (editedEvent: EditableCalendarEvent) => {
    setEvents(events.map(event => 
      event.id === editedEvent.id ? { ...editedEvent, onEdit: handleEditEvent, onDelete: handleDeleteEvent } : event
    ));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const eventsWithHandlers = events.map(event => ({
    ...event,
    onEdit: handleEditEvent,
    onDelete: handleDeleteEvent
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">週間カレンダー</h1>
      <WeekView 
        events={eventsWithHandlers}
        currentDate={new Date('2023-05-15')}
      />
    </div>
  );
}

