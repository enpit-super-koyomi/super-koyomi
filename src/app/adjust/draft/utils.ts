import { Period } from '@/lib/scheduling';
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

export function getEventPosition(period: Period): { top: number; height: number } {
  const start = period.start.getHours() * 60 + period.start.getMinutes();
  const end = period.end.getHours() * 60 + period.end.getMinutes();
  const top = (start / 1440) * 100;
  const height = ((end - start) / 1440) * 100;
  return { top, height };
}

