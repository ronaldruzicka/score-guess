import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { Show } from "@/components/show";
import { buildEnrichedMatches } from "@/features/match-center/build-matches";
import { myPredictionsQueryOptions } from "@/features/match-center/queries";
import { gamesQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";

import { BracketRoundColumn } from "./bracket-round";
import {
  buildKnockoutBracket,
  countKnockoutMatches,
} from "./build-bracket";

export function BracketView() {
  const { data: games } = useSuspenseQuery(gamesQueryOptions);
  const { data: teams } = useSuspenseQuery(teamsQueryOptions);
  const { data: predictions } = useSuspenseQuery(myPredictionsQueryOptions);

  const rounds = useMemo(() => {
    const matches = buildEnrichedMatches({
      games,
      predictions,
      teams,
    });

    return buildKnockoutBracket(matches);
  }, [games, predictions, teams]);

  const matchCount = useMemo(() => countKnockoutMatches(rounds), [rounds]);

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
        when={matchCount > 0}
        fallback={
          <p className="py-12 text-center text-sm text-muted-foreground">
            Knockout matches are not available yet. Check back once the group
            stage concludes.
          </p>
        }
      >
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4 @3xl/bracket:gap-6">
            {rounds.map((round) => (
              <BracketRoundColumn key={round.id} round={round} />
            ))}
          </div>
        </div>
      </Show>
    </div>
  );
}
