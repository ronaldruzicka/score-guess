import type { EnrichedMatch } from "@/features/match-center/build-matches";
import { filterMatchesByStage } from "@/features/match-center/build-matches";

import type { BracketRoundConfig } from "./constants";
import { KNOCKOUT_ROUNDS } from "./constants";

export type BracketRound = {
  id: string;
  label: string;
  matches: EnrichedMatch[];
  subtitle: string;
};

function sortMatchesForBracket(matches: EnrichedMatch[]): EnrichedMatch[] {
  return matches.toSorted((a, b) => {
    const kickoffDiff = a.game.kickoff.getTime() - b.game.kickoff.getTime();

    if (kickoffDiff !== 0) {
      return kickoffDiff;
    }

    return a.game.id - b.game.id;
  });
}

function buildRound(
  matches: EnrichedMatch[],
  config: BracketRoundConfig,
): BracketRound {
  return {
    id: config.id,
    label: config.label,
    matches: sortMatchesForBracket(
      filterMatchesByStage(matches, config.types),
    ),
    subtitle: config.subtitle,
  };
}

export function buildKnockoutBracket(
  matches: EnrichedMatch[],
): BracketRound[] {
  return KNOCKOUT_ROUNDS.map((round) => buildRound(matches, round));
}

export function countKnockoutMatches(rounds: BracketRound[]): number {
  return rounds.reduce((total, round) => total + round.matches.length, 0);
}
