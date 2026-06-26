import type { ReactNode } from "react";

import type { EnrichedMatch, MatchTeam } from "./build-matches";

import { UnavailableIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image } from "@unpic/react";

import { Show } from "@/components/show";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getTipResultLabel,
  POINTS_EXACT,
  POINTS_OUTCOME,
} from "@/features/predictions/scoring";
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
        className="h-4 w-6 shrink-0 rounded-xs @xs/recent-match:h-7 @xs/recent-match:w-10.5"
        height={28}
        layout="fixed"
        src={flag}
        width={42}
      />
    );
  }

  return (
    <span className="inline-flex h-4 w-6 shrink-0 items-center justify-center rounded-xs bg-muted text-[0.55rem] text-muted-foreground @xs/recent-match:h-7 @xs/recent-match:w-10 @xs/recent-match:text-[0.65rem]">
      ?
    </span>
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

function ScoreColumnLabel({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <span className={cn("text-[10px] font-bold tracking-[0.2em]", className)}>
      {children}
    </span>
  );
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
        label: "text-[color-mix(in_oklab,var(--destructive),white_25%)]",
        score: "text-[color-mix(in_oklab,var(--destructive),white_25%)]",
      };
    }
    default: {
      // Exhaustiveness check for TypeScript
      const _exhaustiveCheck: never = tone;
      return _exhaustiveCheck;
    }
  }
}

export function RecentMatchListItem({
  match,
}: {
  readonly match: EnrichedMatch;
}) {
  const { awayTeam, game, homeTeam, points, prediction } = match;
  const tipLabel = points === null ? null : getTipResultLabel(points);
  const tipTone = getTipTone(points);
  const { label: tipLabelTone, score: tipScoreTone } = tipToneClasses(tipTone);
  const homeLost = game.homeScore < game.awayScore;
  const awayLost = game.awayScore < game.homeScore;

  return (
    <div
      className={cn(
        "@container/recent-match grid gap-2",
        "grid-cols-[minmax(0,1fr)_auto]",
        "@xs/recent-match:grid-cols-1",
        "@xs/recent-match:gap-y-4",
      )}
    >
      <p
        className={cn(
          "col-start-1 row-start-1 font-bold text-muted-foreground",
          "text-[10px]",
          "@xs/recent-match:col-span-1 @xs/recent-match:row-start-3",
          "@xs/recent-match:text-center @xs/recent-match:text-xs",
        )}
      >
        {formatMatchMeta(match)}
      </p>

      <Show when={prediction !== null}>
        <div
          className={cn(
            "col-start-2 row-start-1 flex justify-end",
            "@xs/recent-match:col-span-1 @xs/recent-match:col-start-1",
            "@xs/recent-match:row-start-1 @xs/recent-match:justify-center",
          )}
        >
          <PointsBadge points={points ?? 0} />
        </div>
      </Show>

      <div
        className={cn(
          "contents",
          "@xs/recent-match:col-span-1 @xs/recent-match:row-start-2",
          "@xs/recent-match:flex @xs/recent-match:items-center",
          "@xs/recent-match:justify-between @xs/recent-match:gap-4",
        )}
      >
        <div
          className={cn(
            "col-start-1 row-start-2 flex min-w-0 items-center gap-3",
            "@xs/recent-match:col-auto @xs/recent-match:row-auto",
            "@xs/recent-match:w-14 @xs/recent-match:shrink-0",
            "@xs/recent-match:flex-col @xs/recent-match:items-center",
            "@xs/recent-match:gap-2",
          )}
        >
          <TeamFlag flag={homeTeam.flag} />
          <span className="truncate text-sm font-bold @xs/recent-match:hidden">
            {homeTeam.name}
          </span>
          <span className="hidden text-xs font-bold tracking-wide @xs/recent-match:inline">
            {homeTeam.code}
          </span>
        </div>

        <span
          className={cn(
            "col-start-2 row-start-2 w-8 text-center text-lg font-black tabular-nums",
            "@xs/recent-match:hidden",
            homeLost ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {game.homeScore}
        </span>

        <div
          className={cn(
            "hidden items-start justify-center gap-8",
            "@xs/recent-match:col-auto @xs/recent-match:flex",
            "@xs/recent-match:row-auto @xs/recent-match:flex-1",
            "@[400px]/recent-match:gap-12",
          )}
        >
          <Show
            when={prediction}
            fallback={
              <div className="flex min-w-16 flex-col items-center gap-1 text-muted-foreground">
                <ScoreColumnLabel>TIP</ScoreColumnLabel>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <HugeiconsIcon
                        className="text-muted-foreground"
                        icon={UnavailableIcon}
                        strokeWidth={2}
                        size={20}
                      />
                    }
                  />
                  <TooltipContent>
                    <p>No tip submitted for this match.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            }
          >
            {(tip) => (
              <div className="flex min-w-16 flex-col items-center gap-1">
                <ScoreColumnLabel className={tipLabelTone}>
                  TIP
                </ScoreColumnLabel>
                <span
                  className={cn(
                    "text-2xl font-black tracking-tight tabular-nums",
                    tipScoreTone,
                  )}
                >
                  {formatScoreLine(tip.homeScore, tip.awayScore)}
                </span>
              </div>
            )}
          </Show>

          <div className="flex min-w-16 flex-col items-center gap-1">
            <ScoreColumnLabel className="text-muted-foreground">
              ACT
            </ScoreColumnLabel>
            <span className="text-2xl font-black tracking-tight text-foreground tabular-nums">
              {formatScoreLine(game.homeScore, game.awayScore)}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "col-start-1 row-start-3 flex min-w-0 items-center gap-3",
            "@xs/recent-match:col-auto @xs/recent-match:row-auto",
            "@xs/recent-match:w-14 @xs/recent-match:shrink-0",
            "@xs/recent-match:flex-col @xs/recent-match:items-center",
            "@xs/recent-match:gap-2",
          )}
        >
          <TeamFlag flag={awayTeam.flag} />
          <span className="truncate text-sm font-bold @xs/recent-match:hidden">
            {awayTeam.name}
          </span>
          <span className="hidden text-xs font-bold tracking-wide @xs/recent-match:inline">
            {awayTeam.code}
          </span>
        </div>

        <span
          className={cn(
            "col-start-2 row-start-3 w-8 text-center text-lg font-black tabular-nums",
            "@xs/recent-match:hidden",
            awayLost ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {game.awayScore}
        </span>
      </div>

      <p
        className={cn(
          "col-span-2 row-start-4 text-[10px] text-muted-foreground",
          "@xs/recent-match:hidden",
        )}
      >
        <Show
          when={prediction}
          fallback={
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={UnavailableIcon} size={10} /> No tip
            </span>
          }
        >
          {(tip) => (
            <>
              Your tip:{" "}
              <span className="text-foreground">
                {tip.homeScore} - {tip.awayScore}
              </span>
              {tipLabel ? ` (${tipLabel})` : null}
            </>
          )}
        </Show>
      </p>
    </div>
  );
}
