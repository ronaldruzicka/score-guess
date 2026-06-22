import type { LeaderboardRow } from "@/features/predictions/functions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/get-initials";
import { cn } from "@/lib/utils";

import {
  formatAccuracy,
  formatLeaderboardPoints,
  getLeaderboardAccuracy,
} from "./leaderboard-utils";

const PODIUM_BORDER: Record<number, string> = {
  1: "border-primary shadow-[0_25px_50px_-12px] shadow-primary/10",
  2: "border-zinc-300 shadow-[0_12px_24px_-8px] shadow-zinc-400/25",
  3: "border-amber-700",
};

const PODIUM_BADGE: Record<number, string> = {
  1: "bg-primary text-primary-foreground",
  2: "bg-zinc-200 text-zinc-800",
  3: "bg-amber-700 text-white",
};

const PODIUM_ORDER: Record<number, string> = {
  1: "order-1 @2xl/leaderboard:order-2",
  2: "order-2 @2xl/leaderboard:order-1",
  3: "order-3 @2xl/leaderboard:order-3",
};

function PodiumStatBox({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-lg border border-border bg-background/80 p-2.5">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-bold text-foreground">{value}</p>
    </div>
  );
}

function PodiumAvatar({
  entry,
  isCurrentUser,
}: {
  readonly entry: LeaderboardRow;
  readonly isCurrentUser: boolean;
}) {
  const isFirst = entry.rank === 1;
  const avatarSize = isFirst ? "size-24" : "size-20";
  const badgeClass = PODIUM_BADGE[entry.rank] ?? "bg-muted text-foreground";

  return (
    <div className="relative">
      <Avatar
        className={cn(
          avatarSize,
          "border-4",
          PODIUM_BORDER[entry.rank] ?? "border-border",
          isCurrentUser && "ring-2 ring-primary ring-offset-2 ring-offset-card",
        )}
      >
        {entry.image ? <AvatarImage alt="" src={entry.image} /> : null}
        <AvatarFallback className="text-lg">
          {getInitials(entry.name)}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "absolute -right-2 -bottom-2 rounded-full border border-background px-2 py-0.5 text-[10px] font-black",
          badgeClass,
        )}
      >
        #{entry.rank}
      </span>
    </div>
  );
}

function PodiumCard({
  entry,
  isCurrentUser,
}: {
  readonly entry: LeaderboardRow;
  readonly isCurrentUser: boolean;
}) {
  const isFirst = entry.rank === 1;
  const accuracy = getLeaderboardAccuracy(entry) ?? 0;

  return (
    <article
      className={cn(
        "relative flex min-h-[320px] min-w-0 flex-col items-center overflow-hidden rounded-xl border bg-card/80 px-6 py-6 backdrop-blur-sm @6xl/leaderboard:min-w-[400px]",
        PODIUM_ORDER[entry.rank],
        isFirst
          ? "border-primary/40 bg-linear-to-br from-primary/15 to-primary/5 shadow-[0_25px_50px_-12px] shadow-primary/10 @5xl/leaderboard:scale-105"
          : "border-border",
        isCurrentUser && !isFirst && "ring-1 ring-primary/50",
      )}
    >
      {isFirst ? (
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/5 to-transparent" />
      ) : null}

      <div className="relative flex w-full min-w-0 flex-col items-center gap-4 pt-2">
        <PodiumAvatar entry={entry} isCurrentUser={isCurrentUser} />

        <div className="w-full min-w-0 text-center">
          <h3
            className={cn(
              "truncate px-1 font-bold text-foreground",
              isFirst ? "font-heading text-2xl font-black" : "text-lg",
            )}
          >
            {isCurrentUser ? `You (${entry.name})` : entry.name}
          </h3>
          <p
            className={cn(
              "mt-1 font-semibold tabular-nums",
              isFirst ? "text-base text-primary" : "text-sm text-emerald-400",
            )}
          >
            {formatLeaderboardPoints(entry.points)} pts
          </p>
        </div>

        {isFirst ? (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="text-muted-foreground">Prediction Rate</span>
              <span className="font-bold text-emerald-400">{accuracy}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(accuracy, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-px border-t border-border pt-3">
              <div className="text-center">
                <p className="text-[10px] font-black tracking-wide text-muted-foreground uppercase">
                  Accuracy
                </p>
                <p className="font-heading text-lg font-black">
                  {formatAccuracy(entry)}
                </p>
              </div>
              <div className="border-l border-border text-center">
                <p className="text-[10px] font-black tracking-wide text-muted-foreground uppercase">
                  Exact
                </p>
                <p className="font-heading text-lg font-black">
                  {entry.exactHits}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full gap-2">
            <PodiumStatBox label="Accuracy" value={formatAccuracy(entry)} />
            <PodiumStatBox
              label="Guesses"
              value={String(entry.scoredPredictions)}
            />
          </div>
        )}
      </div>
    </article>
  );
}

function getPodiumGridClassName(count: number): string {
  if (count === 1) {
    return "mx-auto max-w-sm grid-cols-1";
  }

  if (count === 2) {
    return "mx-auto max-w-2xl grid-cols-1 @2xl/leaderboard:grid-cols-2";
  }

  return "grid-cols-1 @2xl/leaderboard:grid-cols-3";
}

export function LeaderboardPodium({
  currentUserId,
  entries,
}: {
  readonly currentUserId: string;
  readonly entries: LeaderboardRow[];
}) {
  const topThree = entries.slice(0, 3);

  if (topThree.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "hidden max-w-[1400px] items-stretch gap-4 @2xl/leaderboard:grid @2xl/leaderboard:items-end @5xl/leaderboard:gap-6 @6xl/leaderboard:mx-auto",
        getPodiumGridClassName(topThree.length),
      )}
    >
      {topThree.map((entry) => (
        <PodiumCard
          key={entry.userId}
          entry={entry}
          isCurrentUser={entry.userId === currentUserId}
        />
      ))}
    </section>
  );
}
