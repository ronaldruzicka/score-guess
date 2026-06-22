import { eq } from "drizzle-orm";

import { user } from "@/db/auth-schema";
import { db } from "@/db/index";

type SkillTier = "average" | "elite" | "good" | "poor";

export type SeedUser = {
  email: string;
  name: string;
  tier: SkillTier;
};

export const SEED_USERS: SeedUser[] = [
  { email: "kaiser@seed.local", name: "Kaiser_Predicts", tier: "elite" },
  { email: "elite@seed.local", name: "EliteTactics", tier: "elite" },
  { email: "goalmachine@seed.local", name: "GoalMachine_22", tier: "good" },
  { email: "zenith@seed.local", name: "ZenithStriker", tier: "good" },
  { email: "shadow@seed.local", name: "Shadow Analyst", tier: "good" },
  { email: "matrix@seed.local", name: "MatrixFan", tier: "average" },
  { email: "modern@seed.local", name: "Modern_User_88", tier: "average" },
  { email: "tactico@seed.local", name: "Tactico_Nova", tier: "average" },
  { email: "pitch@seed.local", name: "PitchProphet", tier: "average" },
  { email: "derby@seed.local", name: "DerbyDynamo", tier: "poor" },
  { email: "lucky@seed.local", name: "LuckyGuess", tier: "poor" },
  { email: "rookie@seed.local", name: "RookieReader", tier: "poor" },
];

function seedUserId(email: string): string {
  return `seed-${email.split("@")[0]?.replaceAll(".", "-") ?? "user"}`;
}

function avatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

export async function ensureSeedUsers(): Promise<
  { id: string; name: string; tier: SkillTier }[]
> {
  const seeded: { id: string; name: string; tier: SkillTier }[] = [];

  for (const seedUser of SEED_USERS) {
    const id = seedUserId(seedUser.email);
    const [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, seedUser.email))
      .limit(1);

    if (existing) {
      await db
        .update(user)
        .set({
          image: avatarUrl(seedUser.name),
          name: seedUser.name,
        })
        .where(eq(user.id, existing.id));

      seeded.push({
        id: existing.id,
        name: seedUser.name,
        tier: seedUser.tier,
      });
      continue;
    }

    await db.insert(user).values({
      email: seedUser.email,
      emailVerified: true,
      id,
      image: avatarUrl(seedUser.name),
      name: seedUser.name,
    });

    seeded.push({ id, name: seedUser.name, tier: seedUser.tier });
  }

  return seeded;
}
