import type { EnrichedMatch } from "@/features/match-center/build-matches";
import type { Game } from "@/lib/worldcup/schemas";

import type { BracketRoundConfig } from "./constants";

import { filterMatchesByStage } from "@/features/match-center/build-matches";

import {
  orderByParentMatches,
  orderFinalsMatches,
  orderR32Matches,
} from "./bracket-order";
import { KNOCKOUT_ROUNDS } from "./constants";

export type BracketRound = {
  id: string;
  matches: EnrichedMatch[];
};

function orderKnockoutRound({
  allKnockoutMatches,
  matches,
  previousRound,
  roundId,
}: {
  allKnockoutMatches: EnrichedMatch[];
  matches: EnrichedMatch[];
  previousRound: EnrichedMatch[];
  roundId: string;
}): EnrichedMatch[] {
  if (matches.length === 0) {
    return [];
  }

  if (roundId === "r32") {
    return orderR32Matches(matches, allKnockoutMatches);
  }

  if (roundId === "finals") {
    return orderFinalsMatches({
      finalMatches: matches,
      previousRound,
    });
  }

  return orderByParentMatches(previousRound, matches);
}

function buildRound({
  allKnockoutMatches,
  config,
  matches,
  previousRound,
}: {
  allKnockoutMatches: EnrichedMatch[];
  config: BracketRoundConfig;
  matches: EnrichedMatch[];
  previousRound: EnrichedMatch[];
}): BracketRound {
  const roundMatches = filterMatchesByStage(matches, config.types);

  return {
    id: config.id,
    matches: orderKnockoutRound({
      allKnockoutMatches,
      matches: roundMatches,
      previousRound,
      roundId: config.id,
    }),
  };
}

export function buildKnockoutBracket(matches: EnrichedMatch[]): BracketRound[] {
  const knockoutTypes = new Set<Game["type"]>(
    KNOCKOUT_ROUNDS.flatMap((round) => round.types),
  );
  const allKnockoutMatches = matches.filter((match) =>
    knockoutTypes.has(match.game.type),
  );

  const rounds: BracketRound[] = [];
  let previousRound: EnrichedMatch[] = [];

  for (const config of KNOCKOUT_ROUNDS) {
    const round = buildRound({
      allKnockoutMatches,
      config,
      matches,
      previousRound,
    });

    rounds.push(round);
    previousRound = round.matches.filter(
      (match) => match.game.type !== "third",
    );
  }

  return rounds;
}

export function countKnockoutMatches(rounds: BracketRound[]): number {
  return rounds.reduce((total, round) => total + round.matches.length, 0);
}
