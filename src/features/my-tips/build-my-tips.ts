import type { EnrichedMatch } from "@/features/match-center/build-matches";
import type { LeaderboardRow } from "@/features/predictions/functions";

import {
  POINTS_EXACT,
  POINTS_OUTCOME,
  scorePrediction,
} from "@/features/predictions/scoring";

export const MY_TIPS_PAGE_SIZE = 10;

const kickoffDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function filterTippedMatches(matches: EnrichedMatch[]): EnrichedMatch[] {
  return matches
    .filter((match) => match.prediction !== null)
    .toSorted((a, b) => b.game.kickoff.getTime() - a.game.kickoff.getTime());
}

export function formatTipKickoffDate(kickoff: Date): string {
  return kickoffDateFormatter.format(kickoff);
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

export function getLiveTipPoints(match: EnrichedMatch): number | null {
  if (match.game.timeElapsed !== "live" || !match.prediction) {
    return null;
  }

  return scorePrediction(match.prediction, {
    awayScore: match.game.awayScore,
    homeScore: match.game.homeScore,
  });
}

export type TipPointsDisplay =
  | {
      kind: "live";
      label: "Current match";
      points: number;
    }
  | {
      kind: "pending";
      label: "Pending";
    }
  | {
      kind: "scored";
      label: "Exact score" | "Missed" | "Outcome";
      points: number;
    };

export function getTipPointsDisplay(match: EnrichedMatch): TipPointsDisplay {
  if (match.game.timeElapsed === "upcoming") {
    return { kind: "pending", label: "Pending" };
  }

  if (match.game.timeElapsed === "live") {
    const points = getLiveTipPoints(match) ?? 0;

    return {
      kind: "live",
      label: "Current match",
      points,
    };
  }

  const points = match.points ?? 0;

  if (points === POINTS_EXACT) {
    return { kind: "scored", label: "Exact score", points };
  }

  if (points === POINTS_OUTCOME) {
    return { kind: "scored", label: "Outcome", points };
  }

  return { kind: "scored", label: "Missed", points };
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
export function formatTopPercent(rank: number, totalPlayers: number): string {
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
