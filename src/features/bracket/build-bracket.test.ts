import { describe, expect, it } from "vitest";

import type { EnrichedMatch } from "@/features/match-center/build-matches";
import type { Game } from "@/lib/worldcup/schemas";

import { buildKnockoutBracket, countKnockoutMatches } from "./build-bracket";

function createMatch(
  overrides: Partial<Game> & Pick<Game, "id" | "type">,
): EnrichedMatch {
  const game: Game = {
    awayScore: 0,
    awayScorers: null,
    awayTeamId: null,
    awayTeamLabel: "Team B",
    awayTeamName: null,
    finished: false,
    group: "",
    homeScore: 0,
    homeScorers: null,
    homeTeamId: null,
    homeTeamLabel: "Team A",
    homeTeamName: null,
    id: overrides.id,
    kickoff: overrides.kickoff ?? new Date("2026-07-01T18:00:00Z"),
    localDate: "07/01/2026 14:00",
    matchday: 1,
    stadiumId: 1,
    timeElapsed: "upcoming",
    type: overrides.type,
    ...overrides,
  };

  return {
    awayTeam: { code: "TEB", flag: null, name: "Team B" },
    game,
    homeTeam: { code: "TEA", flag: null, name: "Team A" },
    points: null,
    prediction: null,
  };
}

describe("buildKnockoutBracket", () => {
  it("groups knockout matches by round and excludes group stage", () => {
    const matches = [
      createMatch({ id: 1, type: "group" }),
      createMatch({ id: 49, kickoff: new Date("2026-07-05T18:00:00Z"), type: "r32" }),
      createMatch({ id: 50, kickoff: new Date("2026-07-04T18:00:00Z"), type: "r32" }),
      createMatch({ id: 57, type: "r16" }),
      createMatch({ id: 61, type: "qf" }),
      createMatch({ id: 63, type: "sf" }),
      createMatch({ id: 64, type: "third" }),
      createMatch({ id: 65, type: "final" }),
    ];

    const rounds = buildKnockoutBracket(matches);

    expect(rounds).toHaveLength(5);
    expect(rounds.map((round) => round.id)).toEqual([
      "r32",
      "r16",
      "qf",
      "sf",
      "finals",
    ]);
    expect(rounds[0]?.matches.map((match) => match.game.id)).toEqual([50, 49]);
    expect(countKnockoutMatches(rounds)).toBe(7);
  });
});
