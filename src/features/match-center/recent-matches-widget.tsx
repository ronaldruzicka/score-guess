import type { EnrichedMatch } from "./build-matches";

import { Clock02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { RecentMatchListItem } from "./recent-match-list-item";

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
          to="/match-center/recent"
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
              <RecentMatchListItem match={match} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
