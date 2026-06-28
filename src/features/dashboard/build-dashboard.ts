import type { LeaderboardRow } from "@/features/predictions/functions";
import type { EnrichedMatch } from "@/lib/worldcup/schemas";

import {
  filterActiveMatches,
  findDefaultStageTab,
  isTippingOpen,
} from "@/features/match-center/build-matches";
import { STAGE_TABS } from "@/features/match-center/constants";

const PREDICTION_WINDOW_MS = 24 * 60 * 60 * 1000;

export function getUpcomingWithin24h(
  matches: EnrichedMatch[],
  now = Date.now(),
): EnrichedMatch[] {
  const cutoff = now + PREDICTION_WINDOW_MS;

  return filterActiveMatches(matches).filter(
    (match) => match.game.kickoff.getTime() <= cutoff,
  );
}

export function sortForPredictionPriority(
  matches: EnrichedMatch[],
): EnrichedMatch[] {
  return matches.toSorted((a, b) => {
    const aUnpredicted = a.prediction === null ? 0 : 1;
    const bUnpredicted = b.prediction === null ? 0 : 1;

    if (aUnpredicted !== bUnpredicted) {
      return aUnpredicted - bUnpredicted;
    }

    return a.game.kickoff.getTime() - b.game.kickoff.getTime();
  });
}

export function countLockingWithin24h(
  matches: EnrichedMatch[],
  now = Date.now(),
): number {
  return getUpcomingWithin24h(matches, now).filter((match) =>
    isTippingOpen(match, now),
  ).length;
}

export function getCurrentUserLeaderboardEntry(
  entries: LeaderboardRow[],
  userId: string,
): LeaderboardRow | undefined {
  return entries.find((entry) => entry.userId === userId);
}

export function getTournamentPhase(matches: EnrichedMatch[]): string {
  const tabId = findDefaultStageTab(matches, STAGE_TABS);
  const tab = STAGE_TABS.find((candidate) => candidate.id === tabId);

  return tab?.subtitle ?? "Tournament";
}
