import type { EnrichedMatch } from "@/features/match-center/build-matches";
import type { Game } from "@/lib/worldcup/schemas";

import { describe, expect, it } from "vitest";

import { R32_BRACKET_ORDER } from "./bracket-order";
import { buildSingleEliminationMatches } from "./build-single-elimination-matches";

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

describe("buildSingleEliminationMatches", () => {
  it("links knockout rounds into a single-elimination tree", () => {
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
        awayTeamLabel: "Winner Match 90",
        homeTeamLabel: "Winner Match 89",
        id: 97,
        type: "qf",
      }),
      createMatch({
        awayTeamLabel: "Winner Match 102",
        homeTeamLabel: "Winner Match 101",
        id: 104,
        type: "final",
      }),
      createMatch({
        awayTeamLabel: "Loser Match 102",
        homeTeamLabel: "Loser Match 101",
        id: 103,
        type: "third",
      }),
      ...[73, 75, 74, 77].map((id) =>
        createMatch({
          awayTeamLabel: `Away ${id}`,
          homeTeamLabel: `Home ${id}`,
          id,
          type: "r32",
        }),
      ),
    ];

    const { matches: bracketMatches, thirdPlaceMatch } =
      buildSingleEliminationMatches(matches);

    expect(thirdPlaceMatch?.game.id).toBe(103);
    expect(bracketMatches.find((match) => match.id === 73)?.nextMatchId).toBe(
      90,
    );
    expect(bracketMatches.find((match) => match.id === 75)?.nextMatchId).toBe(
      90,
    );
    expect(bracketMatches.find((match) => match.id === 74)?.nextMatchId).toBe(
      89,
    );
    expect(bracketMatches.find((match) => match.id === 77)?.nextMatchId).toBe(
      89,
    );
    expect(bracketMatches.find((match) => match.id === 90)?.nextMatchId).toBe(
      97,
    );
    expect(bracketMatches.find((match) => match.id === 101)?.nextMatchId).toBe(
      104,
    );
    expect(
      bracketMatches.find((match) => match.id === 104)?.nextMatchId,
    ).toBeNull();
    expect(bracketMatches.some((match) => match.id === 103)).toBe(false);
  });

  it("maps finished matches to score results and winners", () => {
    const matches = [
      createMatch({
        awayScore: 1,
        awayTeamLabel: "France",
        homeScore: 2,
        homeTeamLabel: "Brazil",
        id: 104,
        timeElapsed: "finished",
        type: "final",
      }),
    ];

    const { matches: bracketMatches } = buildSingleEliminationMatches(matches);
    const finalMatch = bracketMatches.find((match) => match.id === 104);

    expect(finalMatch?.state).toBe("SCORE_DONE");
    expect(finalMatch?.participants[0]).toMatchObject({
      isWinner: true,
      name: "Team A",
      resultText: "2",
      status: "PLAYED",
    });
    expect(finalMatch?.participants[1]).toMatchObject({
      isWinner: false,
      resultText: "1",
    });
  });

  it("reuses participant ids for the same team across rounds", () => {
    const matches = [
      createMatch({
        awayScore: 0,
        awayTeamId: 2,
        homeScore: 2,
        homeTeamId: 1,
        id: 73,
        timeElapsed: "finished",
        type: "r32",
      }),
      createMatch({
        awayScore: 1,
        awayTeamId: 3,
        homeScore: 3,
        homeTeamId: 1,
        id: 90,
        timeElapsed: "finished",
        type: "r16",
      }),
    ];

    const { matches: bracketMatches } = buildSingleEliminationMatches(matches);
    const r32 = bracketMatches.find((match) => match.id === 73);
    const r16 = bracketMatches.find((match) => match.id === 90);

    expect(r32?.participants[0]?.id).toBe(1);
    expect(r16?.participants[0]?.id).toBe(1);
  });

  it("uses the full round-of-32 order when all matches are present", () => {
    const matches = R32_BRACKET_ORDER.map((id) =>
      createMatch({
        awayTeamLabel: `Away ${id}`,
        homeTeamLabel: `Home ${id}`,
        id,
        type: "r32",
      }),
    );

    const { matches: bracketMatches } = buildSingleEliminationMatches(matches);
    const r32Ids = bracketMatches
      .filter((match) => match.tournamentRoundText === "1")
      .map((match) => match.id);

    expect(r32Ids).toEqual([...R32_BRACKET_ORDER]);
  });
});
