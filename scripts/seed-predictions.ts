import "./load-env.ts";
import { db } from "@/db/index";
import { predictions } from "@/db/schema";

import { ensureSeedUsers } from "./seed-users";

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

type SkillTier = "average" | "elite" | "good" | "poor";

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

function exactScore(home: number, away: number) {
  return { awayScore: away, homeScore: home };
}

function outcomeScore(home: number, away: number) {
  if (home === away) {
    return { awayScore: away, homeScore: home + 1 };
  }

  if (home > away) {
    return { awayScore: away + 1, homeScore: home };
  }

  return { awayScore: away, homeScore: home + 1 };
}

function missScore(home: number, away: number, gameIndex: number) {
  const variants = [
    { awayScore: away + 1, homeScore: home + 1 },
    {
      awayScore: away === 0 ? 1 : away - 1,
      homeScore: home === 0 ? 1 : home - 1,
    },
    { awayScore: away + 2, homeScore: home },
    { awayScore: away, homeScore: home + 2 },
  ];

  return variants[gameIndex % variants.length] ?? variants[0];
}

function buildPredictionForTier({
  away,
  gameIndex,
  home,
  tier,
  userIndex,
}: {
  away: number;
  gameIndex: number;
  home: number;
  tier: SkillTier;
  userIndex: number;
}): { awayScore: number; homeScore: number } {
  const roll = (gameIndex * 17 + userIndex * 11) % 10;

  if (tier === "elite") {
    if (roll < 5) {
      return exactScore(home, away);
    }

    if (roll < 8) {
      return outcomeScore(home, away);
    }

    return missScore(home, away, gameIndex);
  }

  if (tier === "good") {
    if (roll < 2) {
      return exactScore(home, away);
    }

    if (roll < 6) {
      return outcomeScore(home, away);
    }

    return missScore(home, away, gameIndex);
  }

  if (tier === "average") {
    if (roll < 1) {
      return exactScore(home, away);
    }

    if (roll < 4) {
      return outcomeScore(home, away);
    }

    return missScore(home, away, gameIndex);
  }

  if (roll < 3) {
    return outcomeScore(home, away);
  }

  return missScore(home, away, gameIndex);
}

function shouldSkipMatch({
  gameIndex,
  tier,
  userIndex,
}: {
  gameIndex: number;
  tier: SkillTier;
  userIndex: number;
}): boolean {
  if (tier === "elite" || tier === "good") {
    return false;
  }

  if (tier === "average") {
    return (gameIndex + userIndex) % 7 === 0;
  }

  return (gameIndex + userIndex) % 4 === 0;
}

async function main() {
  const finishedGames = await fetchFinishedGames();

  if (finishedGames.length === 0) {
    console.log("No finished games found.");
    return;
  }

  const seedUsers = await ensureSeedUsers();
  const seedRows: SeedPrediction[] = [];

  for (const [index, game] of finishedGames.entries()) {
    for (const [userIndex, seedUser] of seedUsers.entries()) {
      if (
        shouldSkipMatch({
          gameIndex: index,
          tier: seedUser.tier,
          userIndex,
        })
      ) {
        continue;
      }

      const tip = buildPredictionForTier({
        away: game.awayScore,
        gameIndex: index,
        home: game.homeScore,
        tier: seedUser.tier,
        userIndex,
      });

      seedRows.push({
        awayScore: tip.awayScore,
        homeScore: tip.homeScore,
        matchId: game.id,
        userId: seedUser.id,
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
    `Ensured ${seedUsers.length} seed users and ${seedRows.length} predictions across ${finishedGames.length} finished matches.`,
  );

  for (const seedUser of seedUsers) {
    console.log(
      `${seedUser.name} (${seedUser.tier}): ${byUser.get(seedUser.id) ?? 0} predictions`,
    );
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
