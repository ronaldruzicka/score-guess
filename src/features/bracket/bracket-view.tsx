import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { Show } from "@/components/show";
import { buildEnrichedMatches } from "@/features/match-center/build-matches";
import { myPredictionsQueryOptions } from "@/features/match-center/queries";
import { gamesQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";

import { BracketTournamentView } from "./bracket-tournament-view";
import {
  buildSingleEliminationMatches,
  countSingleEliminationMatches,
} from "./build-single-elimination-matches";

export function BracketView() {
  const { data: games } = useSuspenseQuery(gamesQueryOptions);
  const { data: teams } = useSuspenseQuery(teamsQueryOptions);
  const { data: predictions } = useSuspenseQuery(myPredictionsQueryOptions);

  const bracketData = useMemo(() => {
    const enrichedMatches = buildEnrichedMatches({
      games,
      predictions,
      teams,
    });
    const singleElimination = buildSingleEliminationMatches(enrichedMatches);

    return {
      enrichedMatches,
      matchCount: countSingleEliminationMatches(singleElimination),
      ...singleElimination,
    };
  }, [games, predictions, teams]);

  return (
    <div className="@container/bracket flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Knockout Bracket
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tournament tree from the Round of 32 through the Final.
        </p>
      </div>

      <Show
        when={bracketData.matchCount > 0}
        fallback={
          <p className="py-12 text-center text-sm text-muted-foreground">
            Knockout matches are not available yet. Check back once the group
            stage concludes.
          </p>
        }
      >
        <BracketTournamentView
          enrichedMatches={bracketData.enrichedMatches}
          matches={bracketData.matches}
          thirdPlaceMatch={bracketData.thirdPlaceMatch}
        />
      </Show>
    </div>
  );
}
