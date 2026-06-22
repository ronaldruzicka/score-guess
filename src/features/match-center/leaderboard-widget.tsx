import type { LeaderboardRow } from "@/features/predictions/functions";

import {
  TradeDownIcon,
  TradeUpIcon,
  ChartIcon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Show } from "@/components/show";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { leaderboardQueryOptions } from "./queries";

const TREND_ICON_SIZE = 16;

function TrendIcon({ rank }: { readonly rank: number }) {
  if (rank === 1) {
    return (
      <HugeiconsIcon
        className="text-emerald-400"
        icon={TradeUpIcon}
        strokeWidth={2}
        size={TREND_ICON_SIZE}
      />
    );
  }

  if (rank <= 3) {
    return (
      <HugeiconsIcon
        className="text-muted-foreground"
        icon={MinusSignIcon}
        strokeWidth={2}
        size={TREND_ICON_SIZE}
      />
    );
  }

  return (
    <HugeiconsIcon
      className="text-destructive"
      icon={TradeDownIcon}
      strokeWidth={2}
      size={TREND_ICON_SIZE}
    />
  );
}

function LeaderboardRowItem({
  entry,
  isCurrentUser,
}: {
  readonly entry: LeaderboardRow;
  readonly isCurrentUser: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
            isCurrentUser
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted/60 text-foreground",
          )}
        >
          {entry.rank}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold">
            {isCurrentUser ? `You (${entry.name})` : entry.name}
          </p>
          <p className="text-xs text-muted-foreground">{entry.points} pts</p>
        </div>
      </div>
      <TrendIcon rank={entry.rank} />
    </div>
  );
}

function LeaderboardContent({
  currentUserId,
  entries,
}: {
  readonly currentUserId: string;
  readonly entries: LeaderboardRow[];
}) {
  const topEntries = entries.slice(0, 2);

  const currentUserEntry = entries.find(
    (entry) => entry.userId === currentUserId,
  );

  const showCurrentUserSeparately =
    currentUserEntry !== undefined &&
    !topEntries.some((entry) => entry.userId === currentUserId);

  if (entries.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No leaderboard entries yet.
      </p>
    );
  }

  return (
    <>
      {topEntries.map((entry) => (
        <LeaderboardRowItem
          key={entry.userId}
          entry={entry}
          isCurrentUser={entry.userId === currentUserId}
        />
      ))}
      <Show when={showCurrentUserSeparately && currentUserEntry}>
        {(entry) => (
          <div className="border-t border-border pt-4">
            <LeaderboardRowItem entry={entry} isCurrentUser />
          </div>
        )}
      </Show>
    </>
  );
}

function LeaderboardBody({
  currentUserId,
  entries,
  isError,
  isPending,
}: Readonly<{
  currentUserId: string;
  entries: LeaderboardRow[];
  isError: boolean;
  isPending: boolean;
}>) {
  if (isPending) {
    return (
      <>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Leaderboard is unavailable right now.
      </p>
    );
  }

  return <LeaderboardContent currentUserId={currentUserId} entries={entries} />;
}

export function LeaderboardWidget({
  currentUserId,
}: {
  readonly currentUserId: string;
}) {
  const {
    data: entries = [],
    isError,
    isPending,
  } = useQuery(leaderboardQueryOptions);

  return (
    <Card className="gap-0 overflow-hidden border-border/80 bg-card/80 py-0 backdrop-blur-sm">
      <CardHeader className="flex-row items-center justify-between border-b bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            className="size-4 text-muted-foreground"
            icon={ChartIcon}
            strokeWidth={2}
          />
          <h2 className="text-sm font-bold tracking-[0.07em] uppercase">
            Leaderboard
          </h2>
        </div>
        <Link
          className="text-[10px] font-black text-primary hover:text-primary/80"
          to="/leaderboard"
        >
          VIEW ALL
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 py-5">
        <LeaderboardBody
          currentUserId={currentUserId}
          entries={entries}
          isError={isError}
          isPending={isPending}
        />
      </CardContent>
    </Card>
  );
}
