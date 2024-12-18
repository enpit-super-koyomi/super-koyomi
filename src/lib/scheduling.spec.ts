import { describe, it } from "node:test"
import { strictEqual } from "node:assert"
import { Period, schedule } from "./scheduling"

describe("Scheduling Algorithm Test", function () {
  it("should be idle from 2024-09-03 09:30 until 10:30", function () {
    const EVENTS_A: Period[] = [
      {
        start: new Date(2024, 8, 3, 9, 0),
        end: new Date(2024, 8, 3, 9, 30),
      },
    ]

    const EVENTS_B: Period[] = [
      {
        start: new Date(2024, 8, 3, 10, 30),
        end: new Date(2024, 8, 3, 11, 15),
      },
    ]

    const idle = schedule([EVENTS_A, EVENTS_B])
    console.debug(idle.start.toLocaleString(), "--", idle.end.toLocaleString())
    strictEqual(idle.start.getTime(), EVENTS_A[0].end.getTime())
    strictEqual(idle.end.getTime(), EVENTS_B[0].start.getTime())
  })

  it("should be same for reversed events", function () {
    const EVENTS_A: Period[] = [
      {
        start: new Date(2024, 8, 3, 9, 0),
        end: new Date(2024, 8, 3, 9, 30),
      },
    ]

    const EVENTS_B: Period[] = [
      {
        start: new Date(2024, 8, 3, 10, 30),
        end: new Date(2024, 8, 3, 11, 15),
      },
    ]

    const idle = schedule([EVENTS_B, EVENTS_A])
    console.debug(idle.start.toLocaleString(), "--", idle.end.toLocaleString())
    strictEqual(idle.start.getTime(), EVENTS_A[0].end.getTime())
    strictEqual(idle.end.getTime(), EVENTS_B[0].start.getTime())
  })

  it("should be idle from 2024-09-03 11:25 until 12:25", function () {
    const EVENTS_A: Period[] = [
      { start: new Date(2024, 8, 3, 9, 0), end: new Date(2024, 8, 3, 9, 30) },
      {
        start: new Date(2024, 8, 3, 10, 10),
        end: new Date(2024, 8, 3, 11, 25),
      },
      { start: new Date(2024, 8, 3, 15, 15), end: new Date(2024, 8, 3, 18, 0) },
    ]

    const EVENTS_B: Period[] = [
      {
        start: new Date(2024, 8, 3, 10, 10),
        end: new Date(2024, 8, 3, 11, 25),
      },
      {
        start: new Date(2024, 8, 3, 13, 15),
        end: new Date(2024, 8, 3, 16, 30),
      },
    ]

    const idle = schedule([EVENTS_B, EVENTS_A])
    console.debug(idle.start.toLocaleString(), "--", idle.end.toLocaleString())
    const expectedStartMilliseconds = new Date(2024, 8, 3, 11, 25).getTime()
    strictEqual(idle.start.getTime(), expectedStartMilliseconds)
    strictEqual(idle.end.getTime(), expectedStartMilliseconds + 3600 * 1e3)
  })
})
