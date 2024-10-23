export type Period = {
  start: Date,
  end: Date
};

export function schedule(eventsOfUsers: Period[][]): Period {
  const start = window.performance.now()
  const eventDuration = 1000 * 60 * 60
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

      if (freeDateEnd.getTime() - freeDateStart.getTime() >= eventDuration) {
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
  const end = window.performance.now()
  console.log(`schedule took ${end - start}ms`)
  return {
    start: freeDateStart,
    end: new Date(freeDateStart.getTime() + eventDuration)
  };
}

export function findFreeDurations(eventsOfUsers: Period[][]): Period[] {
  const start = window.performance.now()
  const eventDuration = 1000 * 60 * 60
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

      if (freeDateEnd.getTime() - freeDateStart.getTime() >= eventDuration) {
        candidate.push({start: freeDateStart, end: new Date(freeDateStart.getTime() + eventDuration)});
      }
    }

    busyCount += change.countDelta;

    if (busyCount === 0) {
      freeDateStart = change.timestamp;
    }
  }

  const end = window.performance.now()
  console.log(`findFreeDurations took ${end - start}ms`)
  return candidate
}
