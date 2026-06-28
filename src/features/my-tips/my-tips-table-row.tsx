import type { EnrichedMatch } from "@/features/match-center/build-matches";

import { Image } from "@unpic/react";

import { TableCell, TableRow } from "@/components/ui/table";
import { formatMatchStageLabel } from "@/features/match-center/build-matches";
import { MatchStatusBadge } from "@/features/match-center/match-status-badge";
import { cn } from "@/lib/utils";

import {
  formatScoreLine,
  formatTipKickoffDate,
  getFinalScoreTone,
  getTipPointsDisplay,
} from "./build-my-tips";

function TeamFlag({ flag }: { readonly flag: string | null }) {
  if (flag) {
    return (
      <Image
        alt=""
        className="h-4 w-6 shrink-0 rounded-xs"
        height={16}
        layout="fixed"
        src={flag}
        width={24}
      />
    );
  }

  return (
    <span className="inline-flex h-4 w-6 shrink-0 items-center justify-center rounded-xs bg-muted text-[0.55rem] text-muted-foreground">
      ?
    </span>
  );
}

function MatchCell({ match }: { readonly match: EnrichedMatch }) {
  const { awayTeam, homeTeam } = match;

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <TeamFlag flag={homeTeam.flag} />
        <span className="text-xs font-bold">{homeTeam.code}</span>
      </div>
      <span className="text-xs text-muted-foreground italic">vs</span>
      <div className="flex flex-col items-center gap-1">
        <TeamFlag flag={awayTeam.flag} />
        <span className="text-xs font-bold">{awayTeam.code}</span>
      </div>
    </div>
  );
}

const finalScoreToneClasses = {
  default: "text-foreground",
  exact: "text-emerald-500",
  miss: "text-destructive",
  muted: "text-muted-foreground",
} as const;

const pointsToneClasses = {
  live: "text-primary",
  missed: "text-destructive",
  neutral: "text-muted-foreground",
  scored: "text-emerald-500",
} as const;

function getPointsTone(
  display: ReturnType<typeof getTipPointsDisplay>,
): keyof typeof pointsToneClasses {
  if (display.kind === "pending") {
    return "neutral";
  }

  if (display.kind === "live") {
    return "live";
  }

  if (display.label === "Missed") {
    return "missed";
  }

  if (display.label === "Outcome") {
    return "live";
  }

  return "scored";
}

function formatPointsValue(
  display: ReturnType<typeof getTipPointsDisplay>,
): string {
  if (display.kind === "pending") {
    return "--";
  }

  if (display.points > 0) {
    return `+${display.points}`;
  }

  return String(display.points);
}

export function MyTipsTableRow({ match }: { readonly match: EnrichedMatch }) {
  const { game, prediction } = match;
  const pointsDisplay = getTipPointsDisplay(match);
  const finalScoreTone = getFinalScoreTone(match);
  const pointsTone = getPointsTone(pointsDisplay);

  const finalScore =
    game.timeElapsed === "upcoming"
      ? "? - ?"
      : formatScoreLine(game.homeScore, game.awayScore);

  const pointsValue = formatPointsValue(pointsDisplay);

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="px-6 py-5">
        <MatchCell match={match} />
      </TableCell>
      <TableCell className="px-6 text-sm text-muted-foreground">
        {formatMatchStageLabel(match)}
      </TableCell>
      <TableCell className="px-6 text-muted-foreground">
        {formatTipKickoffDate(game.kickoff)}
      </TableCell>
      <TableCell className="px-6">
        <MatchStatusBadge timeElapsed={game.timeElapsed} />
      </TableCell>
      <TableCell className="px-6 text-center">
        {prediction ? (
          <span className="font-heading text-lg font-black tracking-widest tabular-nums">
            {formatScoreLine(prediction.homeScore, prediction.awayScore)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="px-6 text-center">
        <span
          className={cn(
            "font-heading text-lg font-black tracking-widest tabular-nums",
            finalScoreToneClasses[finalScoreTone],
          )}
        >
          {finalScore}
        </span>
      </TableCell>
      <TableCell className="px-6 text-right">
        <div className="flex flex-col items-end">
          <span
            className={cn(
              "text-base font-bold tabular-nums",
              pointsToneClasses[pointsTone],
            )}
          >
            {pointsValue}
          </span>
          <span
            className={cn(
              "text-[9px] tracking-tight uppercase",
              pointsDisplay.kind === "scored" &&
                pointsDisplay.label === "Missed"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {pointsDisplay.label}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
