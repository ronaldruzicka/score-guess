import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gamesQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";

import {
  buildEnrichedMatches,
  filterFinishedMatches,
  filterMatchesByStage,
  findDefaultFinishedStageTab,
  groupMatchesByDate,
} from "./build-matches";
import { STAGE_TABS } from "./constants";
import { myPredictionsQueryOptions } from "./queries";
import { RecentMatchListItem } from "./recent-match-list-item";

export function RecentMatchesView() {
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
    () => findDefaultFinishedStageTab(matches, STAGE_TABS),
    [matches],
  );
  const [activeTab, setActiveTab] = useState(defaultTab);

  const activeStageTab = useMemo(
    () => STAGE_TABS.find((tab) => tab.id === activeTab),
    [activeTab],
  );

  const finishedMatches = useMemo(() => {
    if (!activeStageTab) {
      return [];
    }

    return filterFinishedMatches(
      filterMatchesByStage(matches, activeStageTab.types),
    );
  }, [activeStageTab, matches]);

  const matchDays = useMemo(
    () => groupMatchesByDate(finishedMatches),
    [finishedMatches],
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-4 border-b border-border pb-4">
        <div>
          <Link
            className="text-xs font-bold text-primary hover:text-primary/80"
            to="/match-center"
          >
            ← Back to Match Center
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-black tracking-tight">
            Recent Results
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            {activeStageTab?.subtitle} • Finished matches and your tips
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
          No finished matches in this stage yet.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {matchDays.map((day) => (
            <section key={day.dateLabel} className="flex flex-col gap-3">
              <h2 className="font-heading text-base font-semibold">
                {day.dateLabel}
              </h2>
              <div className="flex flex-col gap-3">
                {day.matches.map((match) => (
                  <Card
                    key={match.game.id}
                    className="w-full gap-0 border-border/80 bg-card py-0 shadow-sm"
                  >
                    <CardContent className="px-6 py-5">
                      <RecentMatchListItem match={match} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
