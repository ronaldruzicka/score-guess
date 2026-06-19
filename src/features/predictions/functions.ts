import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { predictions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fetchGames } from "@/lib/worldcup/api";

import { predictionInputSchema } from "./schemas";
import { isExactHit, POINTS_OUTCOME, scorePrediction } from "./scoring";

type MatchResult = {
  awayScore: number;
  homeScore: number;
};

type LeaderboardEntry = {
  correctOutcomes: number;
  exactHits: number;
  image: string | null;
  name: string;
  points: number;
  userId: string;
};

export type LeaderboardRow = LeaderboardEntry & {
  rank: number;
};

type LeaderboardPredictionRow = {
  awayScore: number;
  homeScore: number;
  image: string | null;
  matchId: number;
  name: string;
  userId: string;
};

function accumulateLeaderboardEntry({
  entry,
  row,
  result,
}: {
  entry: LeaderboardEntry | undefined;
  row: LeaderboardPredictionRow;
  result: MatchResult | undefined;
}): LeaderboardEntry {
  const base =
    entry ??
    ({
      correctOutcomes: 0,
      exactHits: 0,
      image: row.image,
      name: row.name,
      points: 0,
      userId: row.userId,
    } satisfies LeaderboardEntry);

  if (!result) {
    return base;
  }

  const points = scorePrediction(row, result);
  const exactHit = isExactHit(row, result);

  return {
    ...base,
    correctOutcomes: base.correctOutcomes + (points === POINTS_OUTCOME ? 1 : 0),
    exactHits: base.exactHits + (exactHit ? 1 : 0),
    points: base.points + points,
  };
}

async function requireUserId(): Promise<string> {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

export const upsertPrediction = createServerFn({ method: "POST" })
  .inputValidator(predictionInputSchema)
  .handler(async ({ data }) => {
    const userId = await requireUserId();

    const { games } = await fetchGames();
    const game = games.find((candidate) => candidate.id === data.matchId);

    if (!game) {
      throw new Error(`Unknown match: ${data.matchId}`);
    }

    if (game.kickoff.getTime() <= Date.now()) {
      throw new Error("Predictions lock at kickoff.");
    }

    await db
      .insert(predictions)
      .values({
        awayScore: data.awayScore,
        homeScore: data.homeScore,
        matchId: data.matchId,
        userId,
      })
      .onConflictDoUpdate({
        set: {
          awayScore: data.awayScore,
          homeScore: data.homeScore,
          updatedAt: new Date(),
        },
        target: [predictions.userId, predictions.matchId],
      });

    return { success: true } as const;
  });

export const getMyPredictions = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();

    return db.select().from(predictions).where(eq(predictions.userId, userId));
  },
);

export const getLeaderboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<LeaderboardRow[]> => {
    await requireUserId();

    const { games } = await fetchGames();
    const results = new Map<number, MatchResult>();

    for (const game of games) {
      if (game.timeElapsed === "finished") {
        results.set(game.id, {
          awayScore: game.awayScore,
          homeScore: game.homeScore,
        });
      }
    }

    const rows = await db
      .select({
        awayScore: predictions.awayScore,
        homeScore: predictions.homeScore,
        image: user.image,
        matchId: predictions.matchId,
        name: user.name,
        userId: predictions.userId,
      })
      .from(predictions)
      .innerJoin(user, eq(predictions.userId, user.id));

    const byUser = new Map<string, LeaderboardEntry>();

    for (const row of rows) {
      const entry = accumulateLeaderboardEntry({
        entry: byUser.get(row.userId),
        result: results.get(row.matchId),
        row,
      });

      byUser.set(row.userId, entry);
    }

    return [...byUser.values()]
      .toSorted(
        (a, b) =>
          b.points - a.points ||
          b.exactHits - a.exactHits ||
          a.name.localeCompare(b.name),
      )
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  },
);
