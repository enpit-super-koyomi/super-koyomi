"use server"

import { getGuestsEvents, getHostEvents } from "@/lib/getEvents";
import { excludePeriodOfOffsetDays } from "./utils";

export type Period = {
  start: Date,
  end: Date
};

export type ExcludePeriod = {
	start: number,
	end: number
}

async function findPeriod(eventDurationMinute: number, eventsOfUsers: Period[][]): Promise<Period> {
  console.debug("This is findPeriod() running in server")

  const eventDuration = 1000 * 60 * eventDurationMinute
  const freeBusyChanges: Array<{ timestamp: Date; countDelta: 1 | -1 }> = [];

  for (const events of eventsOfUsers) {
    for (const event of events) {
      freeBusyChanges.push({ timestamp: event.start, countDelta: 1 });
      freeBusyChanges.push({ timestamp: event.end, countDelta: -1 });
    }
  }

  freeBusyChanges.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // const candidate: Period = [];
  let freeDateStart = new Date();
  let freeDateEnd = new Date();
  let busyCount = 0;
  for (const change of freeBusyChanges) {
    if (busyCount === 0 && change.countDelta === 1) {
      freeDateEnd = change.timestamp;

      if (freeDateEnd.getTime() - freeDateStart.getTime() >= eventDuration && new Date() <= freeDateStart) {
        return {
          start: freeDateStart,
          end: new Date(freeDateStart.getTime() + eventDuration),
        };
      }
    }

    busyCount += change.countDelta;

    if (busyCount === 0) {
      freeDateStart = change.timestamp;
    }
  }

  return {
    start: freeDateStart,
    end: new Date(freeDateStart.getTime() + eventDuration)
  };
}

export async function findFreePeriods(eventDurationMinute: number, eventsOfUsers: Period[][]): Promise<Period[]> {
  const eventDuration = 1000 * 60 * eventDurationMinute
  const freeBusyChanges: Array<{ timestamp: Date; countDelta: 1 | -1 }> = [];

  for (const events of eventsOfUsers) {
    for (const event of events) {
      freeBusyChanges.push({ timestamp: event.start, countDelta: 1 });
      freeBusyChanges.push({ timestamp: event.end, countDelta: -1 });
    }
  }

  freeBusyChanges.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const candidate: Period[] = [];
  let freeDateStart = new Date();
  let freeDateEnd = new Date();
  let busyCount = 0;
  for (const change of freeBusyChanges) {
    if (busyCount === 0 && change.countDelta === 1) {
      freeDateEnd = change.timestamp;

      if (freeDateEnd.getTime() - freeDateStart.getTime() >= eventDuration && new Date() <= freeDateStart) {
        candidate.push({start: freeDateStart, end: freeDateEnd});
      }
    }

    busyCount += change.countDelta;

    if (busyCount === 0) {
      freeDateStart = change.timestamp;
    }
  }
  return candidate
}

export async function schedule(duration: number, userIds: string[], excludePeriod: ExcludePeriod) {
  const hostEvents = await getHostEvents();
  const guestsEvents = await getGuestsEvents(userIds);
  const now = new Date()
  const excludePeriods: Period[] = Array.from(Array(8).keys())
    .map(offsetDays => excludePeriodOfOffsetDays(excludePeriod, offsetDays, now))
  const periodsByUser: Period[][] = [...guestsEvents, hostEvents ?? [], excludePeriods]
  console.log(periodsByUser.map(periods => periods.map(period => ({
    start: period.start.toLocaleString(),
    end: period.end.toLocaleString()
  }))))
  return findPeriod(duration, periodsByUser);
}

export async function periodsOfUsers(userIds: string[], excludePeriod: ExcludePeriod) {
  const hostEvents = await getHostEvents();
  const guestsEvents = await getGuestsEvents(userIds);
  const now = new Date()
  const excludePeriods: Period[] = Array.from(Array(8).keys())
    .map(offsetDays => excludePeriodOfOffsetDays(excludePeriod, offsetDays, now))
  const periodsOfUsers: Period[][] = [...guestsEvents, hostEvents ?? [], excludePeriods]
  console.log(periodsOfUsers.map(periods => periods.map(period => ({
    start: period.start.toLocaleString(),
    end: period.end.toLocaleString()
  }))))

  return periodsOfUsers
}
