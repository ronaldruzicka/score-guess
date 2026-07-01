import type { LeaderboardRow } from "@/features/predictions/functions";

import {
  Award04Icon,
  ChartIcon,
  Target02Icon,
} from "@hugeicons/core-free-icons";

import {
  StatCard,
  StatCardContent,
  StatCardFooter,
  StatCardHeader,
  StatCardValue,
} from "@/components/stat-card";
import {
  formatAccuracy,
  formatLeaderboardPoints,
} from "@/features/leaderboard/leaderboard-utils";
import { cn } from "@/lib/utils";

function formatRankValue(entry: LeaderboardRow | undefined): string {
  if (!entry) {
    return "—";
  }

  return `#${entry.rank}`;
}

function formatTopPercent(rank: number, totalPlayers: number): string {
  if (totalPlayers === 0) {
    return "—";
  }

  const percent = (rank / totalPlayers) * 100;

  if (percent > 0 && percent < 1) {
    return percent.toFixed(1);
  }

  return String(Math.round(percent * 10) / 10);
}

function formatRankSubtext(
  entry: LeaderboardRow | undefined,
  totalPlayers: number,
): string | undefined {
  if (!entry || totalPlayers === 0) {
    return undefined;
  }

  return `Top ${formatTopPercent(entry.rank, totalPlayers)}% of players`;
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function DashboardStats({
  entry,
  totalPlayers,
}: {
  readonly entry: LeaderboardRow | undefined;
  readonly totalPlayers: number;
}) {
  const points = formatLeaderboardPoints(entry?.points ?? 0);
  const rank = formatRankValue(entry);
  const exactHits = String(entry?.exactHits ?? 0);
  const accuracy = entry ? formatAccuracy(entry) : "—";

  const pointsSubtext =
    entry && entry.scoredPredictions > 0
      ? `${entry.scoredPredictions} ${pluralize(entry.scoredPredictions, "match", "matches")} scored`
      : undefined;

  const exactHitsSubtext =
    entry && entry.correctOutcomes > 0
      ? `${entry.correctOutcomes} result-only ${pluralize(entry.correctOutcomes, "hit", "hits")}`
      : undefined;

  const accuracySubtext =
    entry && entry.scoredPredictions > 0
      ? `${entry.exactHits + entry.correctOutcomes} of ${entry.scoredPredictions} predictions earning points`
      : undefined;

  const rankSubtext = formatRankSubtext(entry, totalPlayers);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Award04Icon}>
        <StatCardHeader>Points</StatCardHeader>
        <StatCardContent className={cn(!pointsSubtext && "pb-6")}>
          <StatCardValue>{points}</StatCardValue>
        </StatCardContent>
        {pointsSubtext ? (
          <StatCardFooter>{pointsSubtext}</StatCardFooter>
        ) : null}
      </StatCard>
      <StatCard icon={ChartIcon}>
        <StatCardHeader>Rank</StatCardHeader>
        <StatCardContent className={cn(!rankSubtext && "pb-6")}>
          <StatCardValue>{rank}</StatCardValue>
        </StatCardContent>
        {rankSubtext ? <StatCardFooter>{rankSubtext}</StatCardFooter> : null}
      </StatCard>
      <StatCard icon={Target02Icon}>
        <StatCardHeader>Exact hits</StatCardHeader>
        <StatCardContent className={cn(!exactHitsSubtext && "pb-6")}>
          <StatCardValue>{exactHits}</StatCardValue>
        </StatCardContent>
        {exactHitsSubtext ? (
          <StatCardFooter>{exactHitsSubtext}</StatCardFooter>
        ) : null}
      </StatCard>
      <StatCard icon={ChartIcon}>
        <StatCardHeader>Accuracy</StatCardHeader>
        <StatCardContent className={cn(!accuracySubtext && "pb-6")}>
          <StatCardValue>{accuracy}</StatCardValue>
        </StatCardContent>
        {accuracySubtext ? (
          <StatCardFooter>{accuracySubtext}</StatCardFooter>
        ) : null}
      </StatCard>
    </div>
  );
}
