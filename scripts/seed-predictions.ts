import "dotenv/config";
import { user } from "@/db/auth-schema";
import { db } from "@/db/index";
import { predictions } from "@/db/schema";

const API_BASE_URL = process.env.WORLDCUP_API_URL ?? "https://worldcup26.ir";

type FinishedGame = {
  awayScore: number;
  homeScore: number;
  id: number;
};

type SeedPrediction = {
  awayScore: number;
  homeScore: number;
  matchId: number;
  userId: string;
};

async function fetchFinishedGames(): Promise<FinishedGame[]> {
  const response = await fetch(`${API_BASE_URL}/get/games`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`World Cup API request failed (${response.status})`);
  }

  const json = (await response.json()) as {
    games: {
      away_score: string;
      home_score: string;
      id: string;
      time_elapsed: string;
    }[];
  };

  return json.games
    .filter((game) => game.time_elapsed === "finished")
    .map((game) => ({
      awayScore: Number(game.away_score),
      homeScore: Number(game.home_score),
      id: Number(game.id),
    }))
    .filter(
      (game) =>
        Number.isInteger(game.id) &&
        Number.isInteger(game.homeScore) &&
        Number.isInteger(game.awayScore),
    )
    .toSorted((a, b) => a.id - b.id);
}

function buildVariedPrediction(
  actualHome: number,
  actualAway: number,
  index: number,
): { awayScore: number; homeScore: number } {
  const pattern = index % 4;

  switch (pattern) {
    case 0: {
      return { awayScore: actualAway, homeScore: actualHome };
    }
    case 1: {
      return {
        awayScore: actualAway,
        homeScore: actualHome === actualAway ? actualHome + 1 : actualHome,
      };
    }
    case 2: {
      return {
        awayScore: actualAway + 1,
        homeScore: actualHome + 1,
      };
    }
    default: {
      return {
        awayScore: actualAway === 0 ? 1 : actualAway - 1,
        homeScore: actualHome === 0 ? 1 : actualHome - 1,
      };
    }
  }
}

async function main() {
  const finishedGames = await fetchFinishedGames();

  if (finishedGames.length === 0) {
    console.log("No finished games found.");
    return;
  }

  const users = await db.select({ id: user.id, name: user.name }).from(user);

  if (users.length === 0) {
    throw new Error("No users in database. Sign in first to create a user.");
  }

  const seedRows: SeedPrediction[] = [];

  for (const [index, game] of finishedGames.entries()) {
    for (const [userIndex, dbUser] of users.entries()) {
      const tip = buildVariedPrediction(
        game.homeScore,
        game.awayScore,
        index + userIndex,
      );

      seedRows.push({
        awayScore: tip.awayScore,
        homeScore: tip.homeScore,
        matchId: game.id,
        userId: dbUser.id,
      });
    }
  }

  for (const row of seedRows) {
    await db
      .insert(predictions)
      .values(row)
      .onConflictDoUpdate({
        set: {
          awayScore: row.awayScore,
          homeScore: row.homeScore,
          updatedAt: new Date(),
        },
        target: [predictions.userId, predictions.matchId],
      });
  }

  const inserted = await db
    .select({
      matchId: predictions.matchId,
      userId: predictions.userId,
    })
    .from(predictions);

  const byUser = new Map<string, number>();

  for (const row of inserted) {
    byUser.set(row.userId, (byUser.get(row.userId) ?? 0) + 1);
  }

  console.log(
    `Seeded ${seedRows.length} predictions across ${finishedGames.length} finished matches.`,
  );

  for (const dbUser of users) {
    console.log(`${dbUser.name}: ${byUser.get(dbUser.id) ?? 0} predictions`);
  }
  console.log(
    "Sample match IDs:",
    finishedGames
      .slice(0, 5)
      .map((game) => game.id)
      .join(", "),
  );
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
