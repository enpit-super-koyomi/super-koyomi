export type Period = {
  start: Date,
  end: Date
};

export type ExcludePeriod = {
	start: number,
	end: number
}

export function schedule(eventDurationMinute: number, eventsOfUsers: Period[][]): Period {
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

export function findFreePeriods(eventDurationMinute: number, eventsOfUsers: Period[][]): Period[] {
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
        candidate.push({start: freeDateStart, end: new Date(freeDateStart.getTime() + eventDuration)});
      }
    }

    busyCount += change.countDelta;

    if (busyCount === 0) {
      freeDateStart = change.timestamp;
    }
  }

  return candidate
}
