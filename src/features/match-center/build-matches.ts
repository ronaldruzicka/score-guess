import type { predictions } from "@/db/schema";
import type {
  EnrichedMatch,
  Game,
  GameType,
  MatchDay,
  MatchScore,
  MatchTeam,
  Team,
} from "@/lib/worldcup/schemas";

import type { StageTab } from "./constants";

import { scorePrediction } from "@/features/predictions/scoring";

export type {
  EnrichedMatch,
  MatchDay,
  MatchScore,
  MatchTeam,
} from "@/lib/worldcup/schemas";

type PredictionRow = typeof predictions.$inferSelect;

const LOCAL_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/u;

const kickoffFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  weekday: "short",
});

export function formatKickoff(localDate: string): string {
  const match = LOCAL_DATE_PATTERN.exec(localDate);

  if (!match) {
    return localDate;
  }

  const [, month, day, year, hours, minutes] = match;

  return kickoffFormatter.format(
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
    ),
  );
}

function formatDateHeading(localDate: string): string {
  const match = LOCAL_DATE_PATTERN.exec(localDate);

  if (!match) {
    return localDate;
  }

  const [, month, day, year] = match;

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
}

function resolveTeam({
  fallbackName,
  label,
  team,
}: {
  fallbackName: string | null;
  label: string | null;
  team: Team | undefined;
}): MatchTeam {
  if (team) {
    return { flag: team.flag, name: team.name };
  }

  if (label) {
    return { flag: null, name: label };
  }

  return { flag: null, name: fallbackName ?? "TBD" };
}

function enrichMatch({
  game,
  prediction,
  teamById,
}: {
  game: Game;
  prediction: PredictionRow | undefined;
  teamById: Map<number, Team>;
}): EnrichedMatch {
  const userPrediction: MatchScore | null = prediction
    ? { awayScore: prediction.awayScore, homeScore: prediction.homeScore }
    : null;

  const points =
    game.timeElapsed === "finished" && userPrediction
      ? scorePrediction(userPrediction, {
          awayScore: game.awayScore,
          homeScore: game.homeScore,
        })
      : null;

  return {
    awayTeam: resolveTeam({
      fallbackName: game.awayTeamName,
      label: game.awayTeamLabel,
      team: game.awayTeamId ? teamById.get(game.awayTeamId) : undefined,
    }),
    game,
    homeTeam: resolveTeam({
      fallbackName: game.homeTeamName,
      label: game.homeTeamLabel,
      team: game.homeTeamId ? teamById.get(game.homeTeamId) : undefined,
    }),
    points,
    prediction: userPrediction,
  };
}

export function buildEnrichedMatches({
  games,
  predictions,
  teams,
}: {
  games: Game[];
  predictions: PredictionRow[];
  teams: Team[];
}): EnrichedMatch[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));

  const predictionByMatchId = new Map(
    predictions.map((prediction) => [prediction.matchId, prediction]),
  );

  return games
    .map((game) =>
      enrichMatch({
        game,
        prediction: predictionByMatchId.get(game.id),
        teamById,
      }),
    )
    .toSorted((a, b) => a.game.kickoff.getTime() - b.game.kickoff.getTime());
}

export function groupMatchesByDate(matches: EnrichedMatch[]): MatchDay[] {
  const days: MatchDay[] = [];

  for (const match of matches) {
    const dateLabel = formatDateHeading(match.game.localDate);
    const lastDay = days.at(-1);

    if (lastDay?.dateLabel === dateLabel) {
      lastDay.matches.push(match);
      continue;
    }

    days.push({ dateLabel, matches: [match] });
  }

  return days;
}

export function filterMatchesByStage(
  matches: EnrichedMatch[],
  types: GameType[],
): EnrichedMatch[] {
  const allowed = new Set(types);

  return matches.filter((match) => allowed.has(match.game.type));
}

export function findDefaultStageTab(
  matches: EnrichedMatch[],
  tabs: StageTab[],
): string {
  const liveOrUpcoming = matches.find(
    (match) =>
      match.game.timeElapsed === "live" ||
      match.game.timeElapsed === "upcoming",
  );

  if (liveOrUpcoming) {
    const tab = tabs.find((tab) =>
      tab.types.includes(liveOrUpcoming.game.type),
    );

    if (tab) {
      return tab.id;
    }
  }

  return tabs.at(0)?.id ?? "group";
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const TYPICAL_MATCH_DURATION_MS = 2 * HOUR_MS;
const KICKOFF_COUNTDOWN_WINDOW_MS = 6 * HOUR_MS;

/** Show relative countdown only when kickoff is in the next six hours. */
export function shouldShowKickoffCountdown(
  kickoff: Date,
  now = Date.now(),
): boolean {
  const diff = kickoff.getTime() - now;

  return diff > 0 && diff <= KICKOFF_COUNTDOWN_WINDOW_MS;
}

export function formatKickoffTime(kickoff: Date): string {
  return kickoffFormatter.format(kickoff);
}

export function formatCountdown(kickoff: Date, now = Date.now()): string {
  const diff = kickoff.getTime() - now;

  if (diff <= 0) {
    return "Starting soon";
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `Starts in ${hours}h ${minutes}m`;
  }

  return `Starts in ${minutes}m`;
}

export function isTippingOpen(match: EnrichedMatch, now = Date.now()): boolean {
  return (
    match.game.timeElapsed === "upcoming" && match.game.kickoff.getTime() > now
  );
}

/** Upcoming and in-progress matches shown in the match center (excludes finished). */
export function filterActiveMatches(matches: EnrichedMatch[]): EnrichedMatch[] {
  return matches
    .filter(
      (match) =>
        match.game.timeElapsed === "upcoming" ||
        match.game.timeElapsed === "live",
    )
    .toSorted((a, b) => {
      const aIsLive = a.game.timeElapsed === "live" ? 0 : 1;
      const bIsLive = b.game.timeElapsed === "live" ? 0 : 1;

      if (aIsLive !== bIsLive) {
        return aIsLive - bIsLive;
      }

      return a.game.kickoff.getTime() - b.game.kickoff.getTime();
    });
}

/** Finished matches whose estimated end time falls within the last 24 hours. */
export function getRecentMatches(
  matches: EnrichedMatch[],
  now = Date.now(),
): EnrichedMatch[] {
  const cutoff = now - DAY_MS;

  return matches
    .filter((match) => {
      if (match.game.timeElapsed !== "finished") {
        return false;
      }

      const estimatedFinish =
        match.game.kickoff.getTime() + TYPICAL_MATCH_DURATION_MS;

      return estimatedFinish >= cutoff;
    })
    .toSorted((a, b) => b.game.kickoff.getTime() - a.game.kickoff.getTime());
}

export function formatMatchMeta(match: EnrichedMatch): string {
  const stage =
    match.game.type === "group"
      ? `GROUP ${match.game.group}`
      : match.game.type.toUpperCase();

  return `${stage} • FINISHED`;
}
