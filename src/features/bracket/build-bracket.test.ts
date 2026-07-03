import type { EnrichedMatch } from "@/features/match-center/build-matches";
import type { Game } from "@/lib/worldcup/schemas";

import { describe, expect, it } from "vitest";

import {
  orderByParentMatches,
  orderR32Matches,
  R32_BRACKET_ORDER,
} from "./bracket-order";
import { buildKnockoutBracket, countKnockoutMatches } from "./build-bracket";

function createMatch(
  overrides: Partial<Game> & Pick<Game, "id" | "type">,
): EnrichedMatch {
  const game: Game = {
    awayPenaltyScore: null,
    awayScore: 0,
    awayScorers: null,
    awayTeamId: null,
    awayTeamLabel: overrides.awayTeamLabel ?? "Team B",
    awayTeamName: null,
    finished: false,
    group: "",
    homePenaltyScore: null,
    homeScore: 0,
    homeScorers: null,
    homeTeamId: null,
    homeTeamLabel: overrides.homeTeamLabel ?? "Team A",
    homeTeamName: null,
    kickoff: overrides.kickoff ?? new Date("2026-07-01T18:00:00Z"),
    localDate: "07/01/2026 14:00",
    matchday: 1,
    stadiumId: 1,
    timeElapsed: "upcoming",
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
      createMatch({
        id: 49,
        kickoff: new Date("2026-07-05T18:00:00Z"),
        type: "r32",
      }),
      createMatch({
        id: 50,
        kickoff: new Date("2026-07-04T18:00:00Z"),
        type: "r32",
      }),
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
    expect(rounds[0]?.matches.map((match) => match.game.id)).toEqual([49, 50]);
    expect(countKnockoutMatches(rounds)).toBe(7);
  });

  it("orders the full 2026 knockout tree by feeder matches", () => {
    const matches = [
      createMatch({
        awayTeamLabel: "Winner Match 77",
        homeTeamLabel: "Winner Match 74",
        id: 89,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 75",
        homeTeamLabel: "Winner Match 73",
        id: 90,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 78",
        homeTeamLabel: "Winner Match 76",
        id: 91,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 80",
        homeTeamLabel: "Winner Match 79",
        id: 92,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 84",
        homeTeamLabel: "Winner Match 83",
        id: 93,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 82",
        homeTeamLabel: "Winner Match 81",
        id: 94,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 88",
        homeTeamLabel: "Winner Match 86",
        id: 95,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 87",
        homeTeamLabel: "Winner Match 85",
        id: 96,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 90",
        homeTeamLabel: "Winner Match 89",
        id: 97,
        type: "qf",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 94",
        homeTeamLabel: "Winner Match 93",
        id: 98,
        type: "qf",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 92",
        homeTeamLabel: "Winner Match 91",
        id: 99,
        type: "qf",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 96",
        homeTeamLabel: "Winner Match 95",
        id: 100,
        type: "qf",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 98",
        homeTeamLabel: "Winner Match 97",
        id: 101,
        type: "sf",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 100",
        homeTeamLabel: "Winner Match 99",
        id: 102,
        type: "sf",
      }),
      createMatch({
        awayTeamLabel: "Loser Match 102",
        homeTeamLabel: "Loser Match 101",
        id: 103,
        type: "third",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 102",
        homeTeamLabel: "Winner Match 101",
        id: 104,
        type: "final",
      }),
      ...R32_BRACKET_ORDER.map((id) =>
        createMatch({
          awayTeamLabel: `Away ${id}`,
          homeTeamLabel: `Home ${id}`,
          id,
          type: "r32",
        }),
      ),
    ];

    const rounds = buildKnockoutBracket(matches);

    expect(rounds[0]?.matches.map((match) => match.game.id)).toEqual([
      ...R32_BRACKET_ORDER,
    ]);
    expect(rounds[1]?.matches.map((match) => match.game.id)).toEqual([
      90, 89, 91, 92, 93, 94, 95, 96,
    ]);
    expect(rounds[2]?.matches.map((match) => match.game.id)).toEqual([
      97, 99, 98, 100,
    ]);
    expect(rounds[3]?.matches.map((match) => match.game.id)).toEqual([
      101, 102,
    ]);
    expect(rounds[4]?.matches.map((match) => match.game.id)).toEqual([
      104, 103,
    ]);
  });
});

describe("orderR32Matches", () => {
  it("derives round-of-32 order from round-of-16 feeder labels", () => {
    const r32Matches = [73, 75, 74, 77].map((id) =>
      createMatch({ id, type: "r32" }),
    );
    const allKnockoutMatches = [
      ...r32Matches,
      createMatch({
        awayTeamLabel: "Winner Match 75",
        homeTeamLabel: "Winner Match 73",
        id: 90,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 77",
        homeTeamLabel: "Winner Match 74",
        id: 89,
        type: "r16",
      }),
    ];

    expect(
      orderR32Matches(r32Matches, allKnockoutMatches).map(
        (match) => match.game.id,
      ),
    ).toEqual([73, 75, 74, 77]);
  });
});

describe("orderByParentMatches", () => {
  it("places each match after the two feeders it references", () => {
    const previousRound = [73, 75, 74, 77].map((id) =>
      createMatch({ id, type: "r32" }),
    );
    const currentMatches = [
      createMatch({
        awayTeamLabel: "Winner Match 75",
        homeTeamLabel: "Winner Match 73",
        id: 90,
        type: "r16",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 77",
        homeTeamLabel: "Winner Match 74",
        id: 89,
        type: "r16",
      }),
    ];

    expect(
      orderByParentMatches(previousRound, currentMatches).map(
        (match) => match.game.id,
      ),
    ).toEqual([90, 89]);
  });
});
