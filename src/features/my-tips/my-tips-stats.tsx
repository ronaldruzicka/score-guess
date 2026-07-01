import type { LeaderboardRow } from "@/features/predictions/functions";

import { MinusSignIcon, TradeUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  StatCard,
  StatCardContent,
  StatCardFooter,
  StatCardHeader,
  StatCardValue,
} from "@/components/stat-card";
import { Progress } from "@/components/ui/progress";
import {
  formatAccuracy,
  formatLeaderboardPoints,
  getLeaderboardAccuracy,
} from "@/features/leaderboard/leaderboard-utils";

import { formatRankSubtext, getTipsCoveragePercent } from "./build-my-tips";

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function MyTipsStats({
  entry,
  lastMatchPoints,
  totalMatches,
  totalTips,
  totalPlayers,
}: {
  readonly entry: LeaderboardRow | undefined;
  readonly lastMatchPoints: number | null;
  readonly totalMatches: number;
  readonly totalTips: number;
  readonly totalPlayers: number;
}) {
  const accuracy = entry ? getLeaderboardAccuracy(entry) : null;
  const points = formatLeaderboardPoints(entry?.points ?? 0);
  const rank = entry ? `#${entry.rank}` : "—";
  const coveragePercent = getTipsCoveragePercent(totalTips, totalMatches);
  const showLastMatchPoints = lastMatchPoints !== null && lastMatchPoints > 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard>
        <StatCardHeader>Total tips</StatCardHeader>
        <StatCardContent>
          <StatCardValue>{totalTips}</StatCardValue>
        </StatCardContent>
        <StatCardFooter>
          <Progress
            className="w-full gap-0"
            value={clampPercent(coveragePercent)}
          />
        </StatCardFooter>
      </StatCard>

      <StatCard>
        <StatCardHeader>Accuracy</StatCardHeader>
        <StatCardContent>
          <StatCardValue>{entry ? formatAccuracy(entry) : "—"}</StatCardValue>
        </StatCardContent>
        <StatCardFooter>
          <Progress
            className="w-full gap-0 **:data-[slot=progress-indicator]:bg-emerald-500"
            value={clampPercent(accuracy ?? 0)}
          />
        </StatCardFooter>
      </StatCard>

      <StatCard>
        <StatCardHeader>Total points</StatCardHeader>
        <StatCardContent>
          <StatCardValue>{points}</StatCardValue>
        </StatCardContent>

        <StatCardFooter color={showLastMatchPoints ? "success" : "default"}>
          <HugeiconsIcon
            icon={showLastMatchPoints ? TradeUpIcon : MinusSignIcon}
            size="1em"
            strokeWidth={2}
          />
          {showLastMatchPoints
            ? `+${lastMatchPoints} from last match`
            : "No changes from last match"}
        </StatCardFooter>
      </StatCard>

      <StatCard>
        <StatCardHeader>Rank</StatCardHeader>
        <StatCardContent>
          <StatCardValue>{rank}</StatCardValue>
        </StatCardContent>
        <StatCardFooter>
          {formatRankSubtext(entry, totalPlayers) ?? "—"}
        </StatCardFooter>
      </StatCard>
    </div>
  );
}
