import type { LeaderboardRow } from "@/features/predictions/functions";

export function formatLeaderboardRank(rank: number): string {
  return String(rank).padStart(2, "0");
}

export function formatLeaderboardPoints(points: number): string {
  return points.toLocaleString();
}

export function getLeaderboardAccuracy(
  entry: Pick<
    LeaderboardRow,
    "correctOutcomes" | "exactHits" | "scoredPredictions"
  >,
): number | null {
  if (entry.scoredPredictions === 0) {
    return null;
  }

  const hits = entry.exactHits + entry.correctOutcomes;

  return Math.round((hits / entry.scoredPredictions) * 1000) / 10;
}

export function formatAccuracy(
  entry: Pick<
    LeaderboardRow,
    "correctOutcomes" | "exactHits" | "scoredPredictions"
  >,
): string {
  const accuracy = getLeaderboardAccuracy(entry);

  if (accuracy === null) {
    return "—";
  }

  return `${accuracy}%`;
}
