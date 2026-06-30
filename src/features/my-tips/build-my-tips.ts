import type { EnrichedMatch } from "@/features/match-center/build-matches";
import type { LeaderboardRow } from "@/features/predictions/functions";

import {
  POINTS_EXACT,
  POINTS_OUTCOME,
  scorePrediction,
} from "@/features/predictions/scoring";

export const MY_TIPS_PAGE_SIZE = 10;

const kickoffFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  year: "numeric",
});

export function filterTippedMatches(matches: EnrichedMatch[]): EnrichedMatch[] {
  return matches
    .filter((match) => match.prediction !== null)
    .toSorted((a, b) => b.game.kickoff.getTime() - a.game.kickoff.getTime());
}

export function formatTipKickoffDateTime(kickoff: Date): string {
  return kickoffFormatter.format(kickoff);
}

export function formatScoreLine(homeScore: number, awayScore: number): string {
  return `${homeScore} - ${awayScore}`;
}

export function getLastFinishedTipPoints(
  matches: EnrichedMatch[],
): number | null {
  const [mostRecent] = matches
    .filter(
      (match) =>
        match.game.timeElapsed === "finished" &&
        match.prediction !== null &&
        match.points !== null,
    )
    .toSorted((a, b) => b.game.kickoff.getTime() - a.game.kickoff.getTime());

  return mostRecent?.points ?? null;
}

function getLiveTipPoints(match: EnrichedMatch): number | null {
  if (match.game.timeElapsed !== "live" || !match.prediction) {
    return null;
  }

  return scorePrediction(match.prediction, {
    awayScore: match.game.awayScore,
    homeScore: match.game.homeScore,
  });
}

export type TipPointsKind = "exact" | "missed" | "outcome";

export type TipPointsDisplay = {
  kind: TipPointsKind;
  points: number;
};

export const TIP_POINTS_LABELS: Record<TipPointsKind, string> = {
  exact: "Exact score",
  missed: "Missed",
  outcome: "Outcome",
};

function tipPointsKindFromPoints(points: number): TipPointsKind {
  if (points === POINTS_EXACT) {
    return "exact";
  }

  if (points === POINTS_OUTCOME) {
    return "outcome";
  }

  return "missed";
}

export function getTipPointsDisplay(
  match: EnrichedMatch,
): TipPointsDisplay | null {
  if (match.game.timeElapsed === "upcoming") {
    return null;
  }

  const points =
    match.game.timeElapsed === "live"
      ? (getLiveTipPoints(match) ?? 0)
      : (match.points ?? 0);

  return {
    kind: tipPointsKindFromPoints(points),
    points,
  };
}

export function getTipPointsLabel(
  match: EnrichedMatch,
  display: TipPointsDisplay | null,
): string {
  if (!display) {
    return "Pending";
  }

  if (match.game.timeElapsed === "live") {
    return "Current match";
  }

  return TIP_POINTS_LABELS[display.kind];
}

export type FinalScoreTone = "default" | "exact" | "miss" | "muted";

export function getFinalScoreTone(match: EnrichedMatch): FinalScoreTone {
  if (match.game.timeElapsed === "upcoming") {
    return "muted";
  }

  if (match.game.timeElapsed === "live") {
    return "muted";
  }

  if (match.points === POINTS_EXACT) {
    return "exact";
  }

  if (match.points === 0) {
    return "miss";
  }

  return "default";
}

export function getTipsCoveragePercent(
  totalTips: number,
  totalMatches: number,
): number {
  if (totalMatches === 0) {
    return 0;
  }

  return Math.min(100, Math.round((totalTips / totalMatches) * 100));
}

function formatTopPercent(rank: number, totalPlayers: number): string {
  if (totalPlayers === 0) {
    return "—";
  }

  const percent = (rank / totalPlayers) * 100;

  if (percent > 0 && percent < 1) {
    return percent.toFixed(1);
  }

  return String(Math.round(percent * 10) / 10);
}

export function formatRankSubtext(
  entry: LeaderboardRow | undefined,
  totalPlayers: number,
): string | undefined {
  if (!entry || totalPlayers === 0) {
    return undefined;
  }

  return `Top ${formatTopPercent(entry.rank, totalPlayers)}% of users`;
}
