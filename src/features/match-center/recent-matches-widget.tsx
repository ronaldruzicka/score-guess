import type { EnrichedMatch } from "./build-matches";

import { Clock02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";

import { Show } from "@/components/show";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getTipResultLabel,
  POINTS_EXACT,
} from "@/features/predictions/scoring";
import { cn } from "@/lib/utils";

import { formatMatchMeta } from "./build-matches";

function PointsBadge({ points }: { readonly points: number }) {
  if (points <= 0) {
    return null;
  }

  const isExact = points === POINTS_EXACT;

  return (
    <span
      className={cn(
        "rounded border px-2 py-0.5 text-[10px] font-black",
        isExact
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-primary/20 bg-primary/10 text-primary",
      )}
    >
      +{points} PTS
    </span>
  );
}

function RecentMatchRow({ match }: { readonly match: EnrichedMatch }) {
  const { awayTeam, game, homeTeam, points, prediction } = match;
  const tipLabel = points === null ? null : getTipResultLabel(points);
  const homeLost = game.homeScore < game.awayScore;
  const awayLost = game.awayScore < game.homeScore;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold text-muted-foreground">
          {formatMatchMeta(match)}
        </p>
        <Show when={points}>
          {(scoredPoints) => <PointsBadge points={scoredPoints} />}
        </Show>
      </div>

      <ScoreRow
        flag={homeTeam.flag}
        muted={homeLost}
        name={homeTeam.name}
        score={game.homeScore}
      />
      <ScoreRow
        flag={awayTeam.flag}
        muted={awayLost}
        name={awayTeam.name}
        score={game.awayScore}
      />

      <Show when={prediction}>
        {(tip) => (
          <p className="text-[10px] text-muted-foreground">
            Your tip:{" "}
            <span className="text-foreground">
              {tip.homeScore} - {tip.awayScore}
            </span>
            {tipLabel ? ` (${tipLabel})` : null}
          </p>
        )}
      </Show>
    </div>
  );
}

function ScoreRow({
  flag,
  muted = false,
  name,
  score,
}: {
  readonly flag: string | null;
  readonly muted?: boolean;
  readonly name: string;
  readonly score: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {flag ? (
          <Image
            alt=""
            className="shrink-0 rounded-xs"
            height={16}
            layout="fixed"
            src={flag}
            width={24}
          />
        ) : (
          <span className="inline-flex h-4 w-6 shrink-0 items-center justify-center rounded-xs bg-muted text-[0.55rem] text-muted-foreground">
            ?
          </span>
        )}
        <span className="truncate text-sm font-bold">{name}</span>
      </div>
      <span
        className={cn(
          "w-8 text-center text-lg font-black tabular-nums",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {score}
      </span>
    </div>
  );
}

export function RecentMatchesWidget({
  matches,
}: {
  readonly matches: EnrichedMatch[];
}) {
  return (
    <Card className="gap-0 overflow-hidden border-border/80 bg-card/80 py-0 backdrop-blur-sm">
      <CardHeader className="flex-row items-center justify-between border-b bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            className="size-3.5 text-muted-foreground"
            icon={Clock02Icon}
            strokeWidth={2}
          />
          <h2 className="text-sm font-bold tracking-[0.07em] uppercase">
            Recent Matches
          </h2>
        </div>
        <Link
          className="text-[10px] font-black text-primary hover:text-primary/80"
          to="/match-center"
        >
          VIEW ALL
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 p-0">
        {matches.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No matches finished in the last 24 hours.
          </p>
        ) : (
          matches.map((match, index) => (
            <div
              key={match.game.id}
              className={cn("px-4 py-4", index > 0 && "border-t border-border")}
            >
              <RecentMatchRow match={match} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
