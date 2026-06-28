import type { IconSvgElement } from "@hugeicons/react";

import type { LeaderboardRow } from "@/features/predictions/functions";

import {
  Award04Icon,
  ChartIcon,
  Target02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Card, CardContent } from "@/components/ui/card";
import {
  formatAccuracy,
  formatLeaderboardPoints,
} from "@/features/leaderboard/leaderboard-utils";
import { cn } from "@/lib/utils";

type StatBoxProps = {
  readonly icon: IconSvgElement;
  readonly label: string;
  readonly subtext?: string;
  readonly value: string;
};

function StatBox({ icon, label, subtext, value }: StatBoxProps) {
  return (
    <Card className="relative min-h-[162px] overflow-hidden border-border bg-card py-0 ring-0">
      <HugeiconsIcon
        className="pointer-events-none absolute top-0 right-0 size-20 text-muted-foreground/10"
        icon={icon}
        strokeWidth={1.5}
      />
      <CardContent className="relative flex h-full flex-col justify-between gap-1 p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        <p className="font-heading text-4xl leading-10 font-black tracking-tight text-foreground">
          {value}
        </p>
        {subtext ? (
          <p className={cn("pt-1 text-xs text-muted-foreground")}>{subtext}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

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

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatBox
        icon={Award04Icon}
        label="Points"
        subtext={pointsSubtext}
        value={points}
      />
      <StatBox
        icon={ChartIcon}
        label="Rank"
        subtext={formatRankSubtext(entry, totalPlayers)}
        value={rank}
      />
      <StatBox
        icon={Target02Icon}
        label="Exact hits"
        subtext={exactHitsSubtext}
        value={exactHits}
      />
      <StatBox
        icon={ChartIcon}
        label="Accuracy"
        subtext={accuracySubtext}
        value={accuracy}
      />
    </div>
  );
}
