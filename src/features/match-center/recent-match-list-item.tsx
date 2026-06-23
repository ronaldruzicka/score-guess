import type { EnrichedMatch, MatchTeam } from "./build-matches";

import { Image } from "@unpic/react";

import { Show } from "@/components/show";
import { POINTS_EXACT, POINTS_OUTCOME } from "@/features/predictions/scoring";
import { cn } from "@/lib/utils";

import { formatMatchMeta } from "./build-matches";
import { PointsBadge } from "./points-badge";

function formatScoreLine(homeScore: number, awayScore: number): string {
  return `${homeScore}-${awayScore}`;
}

function TeamFlag({ flag }: { readonly flag: MatchTeam["flag"] }) {
  if (flag) {
    return (
      <Image
        alt=""
        className="shrink-0 rounded-xs"
        height={28}
        layout="fixed"
        src={flag}
        width={42}
      />
    );
  }

  return (
    <span className="inline-flex h-7 w-10 shrink-0 items-center justify-center rounded-xs bg-muted text-[0.65rem] text-muted-foreground">
      ?
    </span>
  );
}

function TeamColumn({ team }: { readonly team: MatchTeam }) {
  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-2">
      <TeamFlag flag={team.flag} />
      <span className="text-xs font-bold tracking-wide">{team.code}</span>
    </div>
  );
}

type TipTone = "exact" | "miss" | "none" | "outcome";

function getTipTone(points: number | null): TipTone {
  if (points === null) {
    return "none";
  }

  if (points === POINTS_EXACT) {
    return "exact";
  }

  if (points === POINTS_OUTCOME) {
    return "outcome";
  }

  return "miss";
}

function tipToneClasses(tone: TipTone): {
  label: string;
  score: string;
} {
  switch (tone) {
    case "exact": {
      return {
        label: "text-emerald-500",
        score: "text-emerald-500",
      };
    }
    case "outcome": {
      return {
        label: "text-primary",
        score: "text-primary",
      };
    }
    case "miss":
    case "none": {
      return {
        label: "text-muted-foreground",
        score: "text-muted-foreground",
      };
    }
    default: {
      return {
        label: "text-muted-foreground",
        score: "text-muted-foreground",
      };
    }
  }
}

function ActScoreColumn({
  awayScore,
  homeScore,
}: {
  readonly awayScore: number;
  readonly homeScore: number;
}) {
  return (
    <div className="flex min-w-16 flex-col items-center gap-1">
      <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
        ACT
      </span>
      <span className="text-2xl font-black tracking-tight text-foreground tabular-nums">
        {formatScoreLine(homeScore, awayScore)}
      </span>
    </div>
  );
}

function TipScoreColumn({
  awayScore,
  homeScore,
  points,
}: {
  readonly awayScore: number;
  readonly homeScore: number;
  readonly points: number | null;
}) {
  const tone = getTipTone(points);
  const { label, score } = tipToneClasses(tone);

  return (
    <div className="flex min-w-16 flex-col items-center gap-1">
      <span className={cn("text-[10px] font-bold tracking-[0.2em]", label)}>
        TIP
      </span>
      <span
        className={cn("text-2xl font-black tracking-tight tabular-nums", score)}
      >
        {formatScoreLine(homeScore, awayScore)}
      </span>
    </div>
  );
}

export function RecentMatchListItem({
  match,
}: {
  readonly match: EnrichedMatch;
}) {
  const { awayTeam, game, homeTeam, points, prediction } = match;

  return (
    <div className="flex flex-col gap-4">
      <Show when={prediction !== null}>
        <div className="flex justify-end">
          <PointsBadge points={points ?? 0} />
        </div>
      </Show>

      <div className="flex items-center justify-between gap-4">
        <TeamColumn team={homeTeam} />

        <div className="flex items-center justify-center gap-8 sm:gap-12">
          <Show
            when={prediction}
            fallback={
              <div className="flex min-w-16 flex-col items-center gap-1">
                <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
                  TIP
                </span>
                <span className="text-2xl font-black text-muted-foreground">
                  —
                </span>
              </div>
            }
          >
            {(tip) => (
              <TipScoreColumn
                awayScore={tip.awayScore}
                homeScore={tip.homeScore}
                points={points}
              />
            )}
          </Show>

          <ActScoreColumn
            awayScore={game.awayScore}
            homeScore={game.homeScore}
          />
        </div>

        <TeamColumn team={awayTeam} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {formatMatchMeta(match)}
      </p>
    </div>
  );
}
