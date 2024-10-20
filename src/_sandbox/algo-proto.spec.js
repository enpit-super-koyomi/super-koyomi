// @ts-check
import { describe, it } from "node:test";
import { findIdlePeriod } from "./algo-proto.js";
import { strictEqual } from "node:assert";

/** @param {[number, number][]} seeds */
function generateEvents(...seeds) {
  return seeds.map((seed) => ({ startMinutes: seed[0], endMinutes: seed[1] }));
}

describe("Algorithm Prototype Test", () => {
  /** @type {import("./algo-proto").Period[][]} */
  const USERS_EVENTS = [
    generateEvents(
      [1, 3],
      [4, 6],
      [9, 11],
      [15, 17],
      [20, 22],
      [26, 28],
      [30, 33],
      [36, 37]
    ),
    generateEvents(
      [5, 7],
      [11, 13],
      [16, 17],
      [20, 21],
      [26, 28],
      [31, 32],
      [38, 40]
    ),
    generateEvents(
      [5, 7],
      [11, 13],
      [16, 17],
      [20, 21],
      [26, 28],
      [31, 32],
      [38, 40]
    ),
  ];

  it("should be idle from 0 to 1", () => {
    const result = findIdlePeriod(USERS_EVENTS, 1);
    strictEqual(result.startMinutes, 0);
    strictEqual(result.endMinutes, 1);
  });

  it("should be idle from 7 to 9", () => {
    const result = findIdlePeriod(USERS_EVENTS, 2);
    strictEqual(result.startMinutes, 7);
    strictEqual(result.endMinutes, 9);
  });

  it("should be idle from 17 to 20", () => {
    const result = findIdlePeriod(USERS_EVENTS, 3);
    strictEqual(result.startMinutes, 17);
    strictEqual(result.endMinutes, 20);
  });

  it("should be idle from 22 to 26", () => {
    const result = findIdlePeriod(USERS_EVENTS, 4);
    strictEqual(result.startMinutes, 22);
    strictEqual(result.endMinutes, 26);
  });

  it("should starts at 40", () => {
    const result = findIdlePeriod(USERS_EVENTS, 999);
    strictEqual(result.startMinutes, 40);
  });
});
