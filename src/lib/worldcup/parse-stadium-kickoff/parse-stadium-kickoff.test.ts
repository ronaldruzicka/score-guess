import { describe, expect, it } from "vitest";

import { parseStadiumKickoff } from "./index";

describe("parseStadiumKickoff", () => {
  it.each([
    {
      expectedUtc: "2026-06-11T17:00:00.000Z",
      localDate: "06/11/2026 13:00",
      stadiumId: 10,
      timeZone: "America/New_York",
    },
    {
      expectedUtc: "2026-06-11T20:00:00.000Z",
      localDate: "06/11/2026 13:00",
      stadiumId: 14,
      timeZone: "America/Los_Angeles",
    },
    {
      expectedUtc: "2026-06-11T19:00:00.000Z",
      localDate: "06/11/2026 13:00",
      stadiumId: 1,
      timeZone: "America/Mexico_City",
    },
    {
      expectedUtc: "2026-06-11T18:00:00.000Z",
      localDate: "06/11/2026 13:00",
      stadiumId: 4,
      timeZone: "America/Chicago",
    },
    {
      expectedUtc: "2026-11-01T18:00:00.000Z",
      localDate: "11/01/2026 13:00",
      stadiumId: 10,
      timeZone: "America/New_York",
    },
  ])(
    "converts $localDate in $timeZone (stadium $stadiumId) to $expectedUtc",
    ({ expectedUtc, localDate, stadiumId }) => {
      expect(parseStadiumKickoff(localDate, stadiumId).toISOString()).toBe(
        expectedUtc,
      );
    },
  );

  it("throws for an unknown stadium id", () => {
    expect(() => parseStadiumKickoff("06/11/2026 13:00", 99)).toThrow(
      "Unknown stadium timezone for id 99",
    );
  });

  it("throws for an invalid date format", () => {
    expect(() => parseStadiumKickoff("2026-06-11 13:00", 10)).toThrow(
      "Unexpected match date format: 2026-06-11 13:00",
    );
  });

  it("throws for an invalid calendar date", () => {
    expect(() => parseStadiumKickoff("02/30/2026 13:00", 10)).toThrow(
      "Invalid kickoff time 02/30/2026 13:00 for timezone America/New_York",
    );
  });
});
