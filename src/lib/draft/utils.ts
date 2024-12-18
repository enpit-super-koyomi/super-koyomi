import { Period } from "@/lib/scheduling";
import { setTimes } from "../utils";

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
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getEventPosition(period: Period): {
  top: number;
  height: number;
} {
  const start = period.start.getHours() * 60 + period.start.getMinutes();
  const end = period.end.getHours() * 60 + period.end.getMinutes();
  const top = (start / 1440) * 100;
  const height = ((end - start) / 1440) * 100;
  return { top, height };
}

export type HoursMinutes = {
  hours: number;
  minutes: number;
};

export function getTimeFromPosition(
  y: number,
  totalHeight: number,
): HoursMinutes {
  const minutesPerDay = 24 * 60;
  const minutesFromMidnight = (y / totalHeight) * minutesPerDay;
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;

  return { hours, minutes };
}

export function roundTime(
  time: HoursMinutes,
  roundMinutes?: number,
): HoursMinutes {
  const r = roundMinutes ?? 5;
  const minutes = Math.round(time.minutes / r) * r;

  return normalizeTime({ hours: time.hours, minutes });
}

export const dateToHoursMinutes = (date: Date): HoursMinutes => ({
  hours: date.getHours(),
  minutes: date.getMinutes(),
});

export const normalizeTime = (time: HoursMinutes): HoursMinutes => {
  const d = setTimes(new Date())(time.hours, time.minutes);
  return {
    hours: d.getHours(),
    minutes: d.getMinutes(),
  };
};

export const sortTimeFunction = (a: HoursMinutes, b: HoursMinutes) =>
  a.hours * 60 + a.minutes - (b.hours * 60 + b.minutes);

export const formatHoursMinutes = ({ hours, minutes }: HoursMinutes) =>
  `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
