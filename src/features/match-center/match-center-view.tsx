import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gamesQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";
import { Route as ProtectedRoute } from "@/routes/_protected/route";

import {
  buildEnrichedMatches,
  filterMatchesByStage,
  filterActiveMatches,
  findDefaultStageTab,
  getRecentMatches,
  groupMatchesByDate,
} from "./build-matches";
import { STAGE_TABS } from "./constants";
import { LeaderboardWidget } from "./leaderboard-widget";
import { MatchCard } from "./match-card";
import { myPredictionsQueryOptions } from "./queries";
import { RecentMatchesWidget } from "./recent-matches-widget";

export function MatchCenterView() {
  const { user } = ProtectedRoute.useRouteContext();
  const { data: games } = useSuspenseQuery(gamesQueryOptions);
  const { data: teams } = useSuspenseQuery(teamsQueryOptions);
  const { data: predictions } = useSuspenseQuery(myPredictionsQueryOptions);

  const matches = useMemo(
    () =>
      buildEnrichedMatches({
        games,
        predictions,
        teams,
      }),
    [games, predictions, teams],
  );

  const defaultTab = useMemo(
    () => findDefaultStageTab(matches, STAGE_TABS),
    [matches],
  );
  const [activeTab, setActiveTab] = useState(defaultTab);

  const activeStageTab = useMemo(
    () => STAGE_TABS.find((tab) => tab.id === activeTab),
    [activeTab],
  );

  const stageMatches = useMemo(() => {
    if (!activeStageTab) {
      return [];
    }

    return filterActiveMatches(
      filterMatchesByStage(matches, activeStageTab.types),
    );
  }, [activeStageTab, matches]);

  const matchDays = useMemo(
    () => groupMatchesByDate(stageMatches),
    [stageMatches],
  );

  const recentMatches = useMemo(() => getRecentMatches(matches), [matches]);

  return (
    <div className="@container/match-center grid gap-8 xl:grid-cols-12">
      <section className="flex flex-col gap-8 xl:col-span-8">
        <header className="flex flex-col gap-4 border-b border-border pb-4">
          <div>
            <h1 className="font-heading text-3xl font-black tracking-tight">
              Upcoming Matches
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              {activeStageTab?.subtitle}
            </p>
          </div>
          <Tabs onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="w-full overflow-x-auto">
              {STAGE_TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </header>

        {matchDays.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No matches in this stage.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {matchDays.map((day) => (
              <section key={day.dateLabel} className="flex flex-col gap-4">
                <h2 className="font-heading text-sm font-semibold text-muted-foreground">
                  {day.dateLabel}
                </h2>
                <div className="grid grid-cols-1 gap-6 @3xl/match-center:grid-cols-2">
                  {day.matches.map((match) => (
                    <MatchCard key={match.game.id} match={match} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <aside className="flex flex-col gap-6 xl:col-span-4">
        <RecentMatchesWidget matches={recentMatches} />
        <LeaderboardWidget currentUserId={user.id} />
      </aside>
    </div>
  );
}
