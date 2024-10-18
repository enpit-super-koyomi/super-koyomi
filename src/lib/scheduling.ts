export type Period = [start: Date, end: Date];

export function schedule(
  eventsOfUsers: Period[][],
  durationSeconds: number
): Period {
  const DEMANDED_MILLISECOND = durationSeconds * 1e3;

  const freeBusyChanges: Array<{ timestamp: Date; countDelta: 1 | -1 }> = [];

  for (const events of eventsOfUsers) {
    for (const event of events) {
      freeBusyChanges.push({ timestamp: event[0], countDelta: 1 });
      freeBusyChanges.push({ timestamp: event[1], countDelta: -1 });
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
      if (
        freeDateEnd.getTime() - freeDateStart.getTime() >=
        DEMANDED_MILLISECOND
      ) {
        return [
          freeDateStart,
          new Date(freeDateStart.getTime() + DEMANDED_MILLISECOND),
        ];
      }
    }

    busyCount += change.countDelta;

    if (busyCount === 0) {
      freeDateStart = change.timestamp;
    }
  }

  return [
    freeDateStart,
    new Date(freeDateStart.getTime() + DEMANDED_MILLISECOND),
  ];
}
