import { describe, it } from "node:test";
import { Period, schedule } from "./scheduling.js";
import { strictEqual } from "node:assert";

describe("Scheduling Algorithm Test", () => {
  const TEST_DATA: Period[][] = [
    [
      [new Date(1 * 1e3), new Date(4 * 1e3)],
      [new Date(6 * 1e3), new Date(9 * 1e3)],
      [new Date(12 * 1e3), new Date(13 * 1e3)],
      [new Date(18 * 1e3), new Date(24 * 1e3)],
    ],
    [
      [new Date(5 * 1e3), new Date(8 * 1e3)],
      [new Date(10 * 1e3), new Date(14 * 1e3)],
      [new Date(19 * 1e3), new Date(24 * 1e3)],
      [new Date(31 * 1e3), new Date(34 * 1e3)],
    ],
  ];

  console.log("TEST_DATA", TEST_DATA);
  console.log("TEST_DATA.flat()", TEST_DATA.flat());

  it("should return [Date(34 * 1e3), Date(3600 * 1e3 + 34)]", () => {
    const DURATION_SEC = 3;
    const resultPeriod = schedule(TEST_DATA, DURATION_SEC);
    console.debug("Result startTime:", resultPeriod[0]);
    console.debug("Result endTime:", resultPeriod[1]);
    strictEqual(resultPeriod[0].getTime(), new Date(14 * 1e3).getTime());
    strictEqual(
      resultPeriod[1].getTime(),
      new Date((14 + DURATION_SEC) * 1e3).getTime()
    );
  });
});
