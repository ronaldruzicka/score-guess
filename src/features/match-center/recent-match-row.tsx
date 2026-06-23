import type { EnrichedMatch } from "./build-matches";

import { UnavailableIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image } from "@unpic/react";

import { Show } from "@/components/show";
import { getTipResultLabel } from "@/features/predictions/scoring";
import { cn } from "@/lib/utils";

import { formatMatchMeta } from "./build-matches";
import { PointsBadge } from "./points-badge";

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

export function RecentMatchRow({ match }: { readonly match: EnrichedMatch }) {
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

      <p className="text-[10px] text-muted-foreground">
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
