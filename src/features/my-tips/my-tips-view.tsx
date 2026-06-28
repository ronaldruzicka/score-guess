import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getCurrentUserLeaderboardEntry } from "@/features/dashboard/build-dashboard";
import { buildEnrichedMatches } from "@/features/match-center/build-matches";
import {
  leaderboardQueryOptions,
  myPredictionsQueryOptions,
} from "@/features/match-center/queries";
import { gamesQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";
import { Route as ProtectedRoute } from "@/routes/_protected/route";

import { filterTippedMatches, getLastFinishedTipPoints } from "./build-my-tips";
import { MyTipsStats } from "./my-tips-stats";
import { MyTipsTable } from "./my-tips-table";

export function MyTipsView() {
  const { user } = ProtectedRoute.useRouteContext();
  const { data: games } = useSuspenseQuery(gamesQueryOptions);
  const { data: teams } = useSuspenseQuery(teamsQueryOptions);
  const { data: predictions } = useSuspenseQuery(myPredictionsQueryOptions);
  const { data: leaderboardEntries } = useSuspenseQuery(
    leaderboardQueryOptions,
  );

  const matches = useMemo(
    () =>
      buildEnrichedMatches({
        games,
        predictions,
        teams,
      }),
    [games, predictions, teams],
  );

  const tippedMatches = useMemo(() => filterTippedMatches(matches), [matches]);

  const userEntry = useMemo(
    () => getCurrentUserLeaderboardEntry(leaderboardEntries, user.id),
    [leaderboardEntries, user.id],
  );

  const lastMatchPoints = useMemo(
    () => getLastFinishedTipPoints(tippedMatches),
    [tippedMatches],
  );

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-heading text-3xl font-black tracking-tight">
          My Tips
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          Track and manage your tournament predictions.
        </p>
      </header>

      <MyTipsStats
        entry={userEntry}
        lastMatchPoints={lastMatchPoints}
        totalMatches={games.length}
        totalTips={tippedMatches.length}
        totalPlayers={leaderboardEntries.length}
      />

      <MyTipsTable matches={tippedMatches} />
    </div>
  );
}
