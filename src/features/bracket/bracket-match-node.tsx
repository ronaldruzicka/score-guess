import type {
  EnrichedMatch,
  MatchTeam,
  TeamMatchResult,
} from "@/features/match-center/build-matches";
import type { Game, TimeElapsed } from "@/lib/worldcup/schemas";

import { Image } from "@unpic/react";

import { MatchResultBadge } from "@/components/match-result-badge";
import { Show } from "@/components/show";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import {
  formatBracketScore,
  getBracketStatusLabel,
  getBracketStatusTooltip,
  wentToPenalties,
} from "./bracket-match-format";

function TeamFlag({ flag }: { readonly flag: MatchTeam["flag"] }) {
  if (flag) {
    return (
      <Image
        alt=""
        className="h-3 w-5 shrink-0 rounded-[2px]"
        height={12}
        layout="fixed"
        src={flag}
        width={20}
      />
    );
  }

  return (
    <span className="inline-flex h-3 w-5 shrink-0 items-center justify-center rounded-[2px] bg-zinc-800 text-[0.5rem] text-muted-foreground">
      ?
    </span>
  );
}

function BracketStatusBadge({
  label,
  timeElapsed,
  tooltip,
}: {
  readonly label: string;
  readonly timeElapsed: TimeElapsed;
  readonly tooltip: string;
}) {
  const isUpcoming = timeElapsed === "upcoming";
  const isLive = timeElapsed === "live";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              "inline-flex rounded px-1.5 py-0.5 text-[10px] leading-[15px] font-bold",
              isUpcoming &&
                "border border-primary/30 tracking-normal text-primary uppercase",
              isLive && "bg-red-950 text-red-300",
              !isUpcoming &&
                !isLive &&
                "bg-zinc-900 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-400",
            )}
          />
        }
      >
        {isLive ? (
          <span className="flex items-center gap-1">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-red-400 motion-safe:animate-pulse"
            />
            {label}
          </span>
        ) : (
          label
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function TeamRow({
  hovered = false,
  matchResult,
  onMouseEnter,
  onMouseLeave,
  penaltyScore,
  score,
  showScore,
  team,
}: {
  readonly hovered?: boolean;
  readonly matchResult: TeamMatchResult["result"] | null;
  readonly onMouseEnter?: () => void;
  readonly onMouseLeave?: () => void;
  readonly penaltyScore: number | null;
  readonly score: number;
  readonly showScore: boolean;
  readonly team: MatchTeam;
}) {
  const rowClassName = cn(
    "flex w-full items-center justify-between gap-3 rounded-md px-1.5 py-0.5 transition-colors",
    hovered && "bg-primary/10 ring-1 ring-primary/50",
  );

  const content = (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <TeamFlag flag={team.flag} />
        <span
          className={cn(
            "truncate text-sm leading-5",
            matchResult === "W"
              ? "font-bold text-zinc-50"
              : "font-medium text-zinc-50",
          )}
          title={team.name}
        >
          {team.name}
        </span>
      </div>
      <Show when={showScore}>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "text-sm leading-5 font-bold tabular-nums",
              matchResult === "W" ? "text-primary" : "text-zinc-400",
            )}
          >
            {formatBracketScore(score, penaltyScore)}
          </span>
          {matchResult ? <MatchResultBadge result={matchResult} /> : null}
        </div>
      </Show>
    </>
  );

  if (onMouseEnter || onMouseLeave) {
    return (
      <button
        className={cn(
          rowClassName,
          "cursor-default border-0 bg-transparent text-left",
        )}
        onBlur={onMouseLeave}
        onFocus={onMouseEnter}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}

function MatchPlaceholder({ game }: { readonly game: Game }) {
  return (
    <div className="flex min-h-[88px] items-center justify-center">
      <BracketStatusBadge
        label={getBracketStatusLabel(game)}
        timeElapsed={game.timeElapsed}
        tooltip={getBracketStatusTooltip(game)}
      />
    </div>
  );
}

function getWinnerSide(
  game: Game,
  showScore: boolean,
): "away" | "draw" | "home" | null {
  if (!showScore) {
    return null;
  }

  if (wentToPenalties(game)) {
    const homePenalty = game.homePenaltyScore ?? 0;
    const awayPenalty = game.awayPenaltyScore ?? 0;

    if (homePenalty > awayPenalty) {
      return "home";
    }

    if (awayPenalty > homePenalty) {
      return "away";
    }

    return "draw";
  }

  if (game.homeScore > game.awayScore) {
    return "home";
  }

  if (game.awayScore > game.homeScore) {
    return "away";
  }

  return "draw";
}

function hasDeterminedTeams(match: EnrichedMatch): boolean {
  const { awayTeam, game, homeTeam } = match;

  return (
    homeTeam.name !== "TBD" ||
    awayTeam.name !== "TBD" ||
    game.homeTeamLabel !== null ||
    game.awayTeamLabel !== null
  );
}

function getTeamMatchResult(
  winnerSide: "away" | "draw" | "home" | null,
  side: "away" | "home",
): TeamMatchResult["result"] | null {
  if (winnerSide === "draw" || winnerSide === null) {
    return null;
  }

  return winnerSide === side ? "W" : "L";
}

type BracketMatchRowInteraction = {
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  side: "away" | "home";
};

export function BracketMatchNode({
  match,
  rows,
}: {
  readonly match: EnrichedMatch;
  readonly rows?: BracketMatchRowInteraction[];
}) {
  const { awayTeam, game, homeTeam } = match;
  const showScore =
    game.timeElapsed === "finished" || game.timeElapsed === "live";
  const winnerSide = getWinnerSide(game, showScore);
  const showPlaceholder =
    game.timeElapsed === "upcoming" && !hasDeterminedTeams(match);

  function getRowInteraction(side: "away" | "home") {
    return rows?.find((row) => row.side === side);
  }

  function getTeamRowProps(side: "away" | "home") {
    const interaction = getRowInteraction(side);
    const team = side === "home" ? homeTeam : awayTeam;

    return {
      hovered: interaction?.hovered ?? false,
      matchResult: getTeamMatchResult(winnerSide, side),
      onMouseEnter: interaction?.onMouseEnter,
      onMouseLeave: interaction?.onMouseLeave,
      penaltyScore:
        side === "home" ? game.homePenaltyScore : game.awayPenaltyScore,
      score: side === "home" ? game.homeScore : game.awayScore,
      showScore,
      team,
    };
  }

  const orderedRows = rows
    ? rows.map((row) => getTeamRowProps(row.side))
    : [getTeamRowProps("home"), getTeamRowProps("away")];

  return (
    <div className="rounded-lg border border-zinc-800 bg-[#121215] p-[17px]">
      <Show when={!showPlaceholder} fallback={<MatchPlaceholder game={game} />}>
        <div className="flex flex-col items-start gap-3">
          <BracketStatusBadge
            label={getBracketStatusLabel(game)}
            timeElapsed={game.timeElapsed}
            tooltip={getBracketStatusTooltip(game)}
          />
          <div className="flex w-full flex-col gap-3">
            {orderedRows.map((row, index) => (
              <TeamRow key={`${row.team.code}-${index}`} {...row} />
            ))}
          </div>
        </div>
      </Show>
    </div>
  );
}
