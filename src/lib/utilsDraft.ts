// ... 既存の関数

export function getTimeFromPosition(y: number, totalHeight: number): { hours: number; minutes: number } {
  const minutesPerDay = 24 * 60
  const minutesFromMidnight = (y / totalHeight) * minutesPerDay
  const hours = Math.floor(minutesFromMidnight / 60)
  const minutes = Math.round((minutesFromMidnight % 60) / 30) * 30 // 30分単位に丸める

  return { hours, minutes: minutes >= 60 ? 0 : minutes }
}

