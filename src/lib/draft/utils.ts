import { Period } from '@/lib/scheduling';

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

export function getTimeFromPosition(y: number, totalHeight: number): { hours: number; minutes: number } {
  const minutesPerDay = 24 * 60
  const minutesFromMidnight = (y / totalHeight) * minutesPerDay
  const hours = Math.floor(minutesFromMidnight / 60)
  const minutes = Math.round((minutesFromMidnight % 60) / 30) * 30 // 30分単位に丸める

  return { hours, minutes: minutes >= 60 ? 0 : minutes }
}

