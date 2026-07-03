import type { ReactNode } from "react";

import type { EnrichedMatch } from "@/features/match-center/build-matches";

import { createContext, useContext, useMemo } from "react";

const BracketMatchLookupContext = createContext<
  ReadonlyMap<number | string, EnrichedMatch>
>(new Map());

export function BracketMatchLookupProvider({
  children,
  enrichedMatches,
}: {
  readonly children: ReactNode;
  readonly enrichedMatches: EnrichedMatch[];
}) {
  const lookup = useMemo(
    () =>
      new Map(enrichedMatches.map((match) => [match.game.id, match] as const)),
    [enrichedMatches],
  );

  return (
    <BracketMatchLookupContext value={lookup}>
      {children}
    </BracketMatchLookupContext>
  );
}

export function useBracketEnrichedMatch(
  matchId: number | string,
): EnrichedMatch | undefined {
  return useContext(BracketMatchLookupContext).get(matchId);
}
