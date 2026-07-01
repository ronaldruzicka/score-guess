import type { EnrichedMatch, MatchTeam } from "@/features/match-center/build-matches";

import { Image } from "@unpic/react";

import { Show } from "@/components/show";
import { Card, CardContent } from "@/components/ui/card";
import { MatchStatusBadge } from "@/features/match-center/match-status-badge";
import { cn } from "@/lib/utils";

function TeamFlag({ flag }: { readonly flag: MatchTeam["flag"] }) {
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

function TeamRow({
  isWinner,
  score,
  showScore,
  team,
}: {
  readonly isWinner: boolean;
  readonly score: number;
  readonly showScore: boolean;
  readonly team: MatchTeam;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <TeamFlag flag={team.flag} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs font-semibold",
          isWinner ? "text-foreground" : "text-muted-foreground",
        )}
        title={team.name}
      >
        {team.name}
      </span>
      <Show when={showScore}>
        <span
          className={cn(
            "w-5 text-right text-sm font-black tabular-nums",
            isWinner ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {score}
        </span>
      </Show>
    </div>
  );
}

function getMatchLabel(match: EnrichedMatch): string {
  if (match.game.type === "third") {
    return "Third Place";
  }

  if (match.game.type === "final") {
    return "Final";
  }

  return `Match ${match.game.id}`;
}

export function BracketMatchNode({
  match,
}: {
  readonly match: EnrichedMatch;
}) {
  const { awayTeam, game, homeTeam } = match;
  const showScore =
    game.timeElapsed === "finished" || game.timeElapsed === "live";
  const homeWinner =
    showScore && game.homeScore > game.awayScore;
  const awayWinner =
    showScore && game.awayScore > game.homeScore;

  return (
    <Card className="border-border/80 bg-card/80 py-0 backdrop-blur-sm">
      <CardContent className="flex flex-col gap-2 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
            {getMatchLabel(match)}
          </span>
          <MatchStatusBadge timeElapsed={game.timeElapsed} />
        </div>
        <div className="flex flex-col gap-1.5">
          <TeamRow
            isWinner={homeWinner}
            score={game.homeScore}
            showScore={showScore}
            team={homeTeam}
          />
          <TeamRow
            isWinner={awayWinner}
            score={game.awayScore}
            showScore={showScore}
            team={awayTeam}
          />
        </div>
      </CardContent>
    </Card>
  );
}
