import type { EnrichedMatch } from "@/features/match-center/build-matches";

const PARENT_MATCH_PATTERN = /(?:Winner|Loser) Match (\d+)/iu;

/**
 * FIFA World Cup 2026 Round of 32 visual bracket order (match IDs 73–88).
 * Adjacent pairs feed into Round of 16 matches 90, 89, 91, 92, 93, 94, 95, 96.
 */
export const R32_BRACKET_ORDER = [
  73, 75, 74, 77, 76, 78, 79, 80, 83, 84, 81, 82, 86, 88, 85, 87,
] as const;

export function getParentMatchIds(match: EnrichedMatch): number[] {
  const ids: number[] = [];

  for (const label of [match.game.homeTeamLabel, match.game.awayTeamLabel]) {
    const parentMatch = label?.match(PARENT_MATCH_PATTERN);

    if (parentMatch) {
      ids.push(Number(parentMatch[1]));
    }
  }

  return ids;
}

function getParentMatchIdSet(match: EnrichedMatch): Set<number> {
  return new Set(getParentMatchIds(match));
}

function getBracketSortKey(match: EnrichedMatch): number {
  const parents = getParentMatchIds(match);

  if (parents.length > 0) {
    return Math.min(...parents);
  }

  return match.game.id;
}

function appendUnorderedMatches({
  matches,
  ordered,
  used,
}: {
  matches: EnrichedMatch[];
  ordered: EnrichedMatch[];
  used: Set<number>;
}): void {
  for (const match of matches.toSorted((a, b) => a.game.id - b.game.id)) {
    if (!used.has(match.game.id)) {
      ordered.push(match);
      used.add(match.game.id);
    }
  }
}

function deriveR32OrderFromR16(r16Matches: EnrichedMatch[]): number[] {
  const bracketR16 = r16Matches.filter(
    (match) => getParentMatchIds(match).length === 2,
  );

  if (bracketR16.length === 0) {
    return [];
  }

  const sortedR16 = bracketR16.toSorted(
    (a, b) => getBracketSortKey(a) - getBracketSortKey(b),
  );

  return sortedR16.flatMap((match) => getParentMatchIds(match));
}

export function orderR32Matches(
  r32Matches: EnrichedMatch[],
  allKnockoutMatches: EnrichedMatch[],
): EnrichedMatch[] {
  const matchById = new Map(r32Matches.map((match) => [match.game.id, match]));
  const ordered: EnrichedMatch[] = [];
  const used = new Set<number>();

  for (const matchId of R32_BRACKET_ORDER) {
    const match = matchById.get(matchId);

    if (match) {
      ordered.push(match);
      used.add(matchId);
    }
  }

  const hasUnorderedMatches = r32Matches.some(
    (match) => !used.has(match.game.id),
  );

  if (hasUnorderedMatches) {
    const r16Matches = allKnockoutMatches.filter(
      (match) => match.game.type === "r16",
    );
    const derivedOrder = deriveR32OrderFromR16(r16Matches);

    for (const matchId of derivedOrder) {
      if (used.has(matchId)) {
        continue;
      }

      const match = matchById.get(matchId);

      if (match) {
        ordered.push(match);
        used.add(matchId);
      }
    }
  }

  appendUnorderedMatches({ matches: r32Matches, ordered, used });

  return ordered;
}

export function orderByParentMatches(
  previousRound: EnrichedMatch[],
  currentMatches: EnrichedMatch[],
): EnrichedMatch[] {
  if (currentMatches.length === 0) {
    return [];
  }

  const ordered: EnrichedMatch[] = [];
  const used = new Set<number>();

  for (let index = 0; index < previousRound.length; index += 2) {
    const parentA = previousRound[index];
    const parentB = previousRound[index + 1];

    if (!parentA || !parentB) {
      continue;
    }

    const match = currentMatches.find((candidate) => {
      if (used.has(candidate.game.id)) {
        return false;
      }

      const candidateParents = getParentMatchIdSet(candidate);

      return (
        candidateParents.size === 2 &&
        candidateParents.has(parentA.game.id) &&
        candidateParents.has(parentB.game.id)
      );
    });

    if (match) {
      ordered.push(match);
      used.add(match.game.id);
    }
  }

  appendUnorderedMatches({ matches: currentMatches, ordered, used });

  return ordered;
}

export function orderMatchesWithParentReferences(
  matches: EnrichedMatch[],
): EnrichedMatch[] {
  return matches.toSorted(
    (a, b) => getBracketSortKey(a) - getBracketSortKey(b),
  );
}

export function orderFinalsMatches({
  finalMatches,
  previousRound,
}: {
  finalMatches: EnrichedMatch[];
  previousRound: EnrichedMatch[];
}): EnrichedMatch[] {
  const thirdPlaceMatches = finalMatches.filter(
    (match) => match.game.type === "third",
  );
  const treeMatches = finalMatches.filter(
    (match) => match.game.type !== "third",
  );
  const orderedTree =
    previousRound.length > 0
      ? orderByParentMatches(previousRound, treeMatches)
      : orderMatchesWithParentReferences(treeMatches);

  return [
    ...orderedTree,
    ...thirdPlaceMatches.toSorted((a, b) => a.game.id - b.game.id),
  ];
}
