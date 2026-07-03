import type { Game } from "@/lib/worldcup/schemas";

import { describe, expect, it } from "vitest";

import {
  formatBracketKickoff,
  formatBracketScore,
  getBracketStatusLabel,
  getBracketStatusTooltip,
  wentToPenalties,
} from "./bracket-match-format";

function createGame(overrides: Partial<Game> & Pick<Game, "id">): Game {
  return {
    awayPenaltyScore: null,
    awayScore: 0,
    awayScorers: null,
    awayTeamId: null,
    awayTeamLabel: null,
    awayTeamName: null,
    finished: false,
    group: "",
    homePenaltyScore: null,
    homeScore: 0,
    homeScorers: null,
    homeTeamId: null,
    homeTeamLabel: null,
    homeTeamName: null,
    kickoff: new Date("2026-07-04T23:00:00Z"),
    localDate: "07/04/2026 19:00",
    matchday: 1,
    stadiumId: 1,
    timeElapsed: "upcoming",
    type: "qf",
    ...overrides,
  };
}

describe("bracket-match-format", () => {
  it("formats upcoming kickoff labels for the bracket badge", () => {
    const kickoff = new Date("2026-07-04T23:00:00Z");
    const label = formatBracketKickoff(kickoff);

    expect(label).toMatch(/^[A-Z]{3} \d{1,2} - \d{1,2}:\d{2} (AM|PM)$/u);
    expect(label).toBe(formatBracketKickoff(kickoff));
  });

  it("formats finished and penalty status labels", () => {
    expect(
      getBracketStatusLabel(
        createGame({ finished: true, id: 1, timeElapsed: "finished" }),
      ),
    ).toBe("FT");

    expect(
      getBracketStatusLabel(
        createGame({
          awayPenaltyScore: 4,
          finished: true,
          homePenaltyScore: 3,
          id: 2,
          timeElapsed: "finished",
        }),
      ),
    ).toBe("FT-PENS");
  });

  it("provides descriptive status tooltips", () => {
    expect(
      getBracketStatusTooltip(createGame({ id: 5, timeElapsed: "live" })),
    ).toBe("Match is currently in progress");

    expect(
      getBracketStatusTooltip(
        createGame({ finished: true, id: 6, timeElapsed: "finished" }),
      ),
    ).toBe("Full time — match finished after 90 minutes");

    expect(
      getBracketStatusTooltip(
        createGame({
          awayPenaltyScore: 4,
          finished: true,
          homePenaltyScore: 3,
          id: 7,
          timeElapsed: "finished",
        }),
      ),
    ).toBe("Full time — decided by penalty shootout after extra time");

    expect(
      getBracketStatusTooltip(
        createGame({
          id: 8,
          kickoff: new Date("2026-07-04T23:00:00Z"),
        }),
      ),
    ).toMatch(/^Scheduled kickoff — /u);
  });

  it("formats penalty shootout scores", () => {
    expect(formatBracketScore(1, 3)).toBe("1 (3)");
    expect(formatBracketScore(2, null)).toBe("2");
  });

  it("detects penalty shootouts", () => {
    expect(
      wentToPenalties(
        createGame({
          awayPenaltyScore: 4,
          homePenaltyScore: 3,
          id: 3,
        }),
      ),
    ).toBe(true);

    expect(wentToPenalties(createGame({ id: 4 }))).toBe(false);
  });
});
