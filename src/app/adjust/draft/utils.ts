import { CalendarEvent } from './types';

export function getWeekDates(date: Date): Date[] {
  const week = [];
  const current = new Date(date);
  current.setDate(current.getDate() - current.getDay());
  for (let i = 0; i < 7; i++) {
    week.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return week;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

export function getEventPosition(event: CalendarEvent): { top: number; height: number } {
  const start = event.start.getHours() * 60 + event.start.getMinutes();
  const end = event.end.getHours() * 60 + event.end.getMinutes();
  const top = (start / 1440) * 100;
  const height = ((end - start) / 1440) * 100;
  return { top, height };
}

