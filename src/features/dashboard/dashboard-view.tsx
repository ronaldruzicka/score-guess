import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Show } from "@/components/show";
import { buildEnrichedMatches } from "@/features/match-center/build-matches";
import { LeaderboardWidget } from "@/features/match-center/leaderboard-widget";
import { MatchCard } from "@/features/match-center/match-card";
import {
  leaderboardQueryOptions,
  myPredictionsQueryOptions,
} from "@/features/match-center/queries";
import { gamesQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";
import { Route as ProtectedRoute } from "@/routes/_protected/route";

import {
  countLockingWithin24h,
  getCurrentUserLeaderboardEntry,
  getTournamentPhase,
  getUpcomingWithin24h,
  sortForPredictionPriority,
} from "./build-dashboard";
import { DashboardHeader } from "./dashboard-header";
import { DashboardStats } from "./dashboard-stats";

export function DashboardView() {
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

  const upcomingWithin24h = useMemo(
    () => sortForPredictionPriority(getUpcomingWithin24h(matches)),
    [matches],
  );

  const lockingCount = useMemo(() => countLockingWithin24h(matches), [matches]);

  const tournamentPhase = useMemo(() => getTournamentPhase(matches), [matches]);

  const userEntry = useMemo(
    () => getCurrentUserLeaderboardEntry(leaderboardEntries, user.id),
    [leaderboardEntries, user.id],
  );

  const allTipped =
    upcomingWithin24h.length > 0 &&
    upcomingWithin24h.every((match) => match.prediction !== null);

  return (
    <div className="@container/dashboard grid gap-8 xl:grid-cols-12">
      <section className="flex flex-col gap-8 xl:col-span-8">
        <DashboardHeader
          lockingCount={lockingCount}
          tournamentPhase={tournamentPhase}
          userName={user.name}
        />

        <DashboardStats
          entry={userEntry}
          totalPlayers={leaderboardEntries.length}
        />

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Predict before kickoff
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {upcomingWithin24h.length > 0
                ? `${upcomingWithin24h.length} match${upcomingWithin24h.length === 1 ? "" : "es"} in the next 24 hours`
                : "No matches in the next 24 hours."}
            </p>
          </div>

          <Show when={upcomingWithin24h.length === 0}>
            <p className="py-8 text-center text-sm text-muted-foreground">
              No matches in the next 24 hours.{" "}
              <Link
                className="font-medium text-primary hover:text-primary/80"
                to="/match-center"
              >
                View full schedule
              </Link>
            </p>
          </Show>

          <Show when={allTipped}>
            <p className="text-sm text-muted-foreground">
              You&apos;re all set for the next 24 hours.
            </p>
          </Show>

          <Show when={upcomingWithin24h.length > 0}>
            <div className="grid grid-cols-1 gap-6 @3xl/dashboard:grid-cols-2">
              {upcomingWithin24h.map((match) => (
                <MatchCard key={match.game.id} match={match} />
              ))}
            </div>
          </Show>
        </section>
      </section>

      <aside className="flex flex-col gap-6 xl:col-span-4">
        <LeaderboardWidget currentUserId={user.id} />
      </aside>
    </div>
  );
}
