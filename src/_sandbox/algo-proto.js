// @ts-check

/**
 * @typedef {Object} Period
 * @prop {number} startMinutes
 * @prop {number} endMinutes
 */

/**
 * @typedef {Object} StatusShift
 * @prop {number} timeMinutes
 * @prop {boolean} isBusy
 */

const DURATION_MINUTES = 60;

/**
 * ?
 * @param {Period[][]} usersEvents - Each users' array of the occupied periods
 * @param {number} [durationMinutes = DURATION_MINUTES] - Demand for duration of the period in minutes (Default: 60)
 * @returns {Period} - Earliest idle period
 */
export function findIdlePeriod(
  usersEvents,
  durationMinutes = DURATION_MINUTES
) {
  /** @type StatusShift[] */
  let shifts = [];
  let busyCount = 0;

  const periods = usersEvents.flat();
  periods.forEach((period) => {
    shifts.push(
      { timeMinutes: period.startMinutes, isBusy: true },
      { timeMinutes: period.endMinutes, isBusy: false }
    );
  });

  shifts.sort((a, b) => a.timeMinutes - b.timeMinutes);

  /** @type {Period} */
  let idle = { startMinutes: 0, endMinutes: 0 };
  shifts.forEach((shift) => {
    if (busyCount === 0) {
      idle.endMinutes = shift.timeMinutes;
      if (idle.endMinutes - idle.startMinutes >= durationMinutes) return idle;
    }

    if (shift.isBusy) {
      busyCount++;
    } else {
      busyCount--;
    }

    if (busyCount < 0) throw new Error("Number of the busy got negative!");
    if (busyCount === 0) idle.startMinutes = shift.timeMinutes;
  });

  idle.endMinutes = idle.startMinutes + durationMinutes;

  return idle;
}
