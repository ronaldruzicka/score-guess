import type { LeaderboardRow } from "@/features/predictions/functions";

import { TradeUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { StatCard } from "@/components/stat-card";
import {
  formatAccuracy,
  formatLeaderboardPoints,
  getLeaderboardAccuracy,
} from "@/features/leaderboard/leaderboard-utils";

import { formatRankSubtext, getTipsCoveragePercent } from "./build-my-tips";

function StatProgress({ percent }: { readonly percent: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

function AccuracyProgress({ percent }: { readonly percent: number | null }) {
  const value = percent ?? 0;

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
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

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total tips" value={String(totalTips)}>
        <StatProgress percent={coveragePercent} />
      </StatCard>

      <StatCard label="Accuracy" value={entry ? formatAccuracy(entry) : "—"}>
        <AccuracyProgress percent={accuracy} />
      </StatCard>

      <StatCard label="Total points" value={points}>
        {lastMatchPoints !== null && lastMatchPoints > 0 ? (
          <StatCard.Subtext color="success">
            <HugeiconsIcon icon={TradeUpIcon} size="1em" strokeWidth={2} />+
            {lastMatchPoints} from last match
          </StatCard.Subtext>
        ) : null}
      </StatCard>

      <StatCard label="Rank" value={rank}>
        <StatCard.Subtext>
          {formatRankSubtext(entry, totalPlayers) ?? "—"}
        </StatCard.Subtext>
      </StatCard>
    </div>
  );
}
