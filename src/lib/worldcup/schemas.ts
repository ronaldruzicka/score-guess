import { z } from "zod";

/**
 * The worldcup26.ir API returns nearly everything as strings
 * ("home_score": "0", "finished": "FALSE"), so these schemas coerce raw
 * payloads into clean, typed domain objects.
 */

const numericString = z.coerce.number();

const stringBoolean = z
  .string()
  .transform((value) => value.toLowerCase() === "true");

/** The API uses the literal string "null" for missing scorer data. */
const nullableString = z
  .string()
  .transform((value) => (value === "null" ? null : value));

// Matches "06/11/2026 13:00" (MM/DD/YYYY HH:mm, stadium-local time).
const LOCAL_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/u;

/**
 * Parses the API's stadium-local kickoff string as UTC. The API provides no
 * timezone, and venues span UTC-4 to UTC-7, so this is up to 7 hours EARLIER
 * than the real kickoff — a safe bound for locking predictions.
 */
function parseLocalDate(value: string): Date {
  const match = LOCAL_DATE_PATTERN.exec(value);

  if (!match) {
    throw new Error(`Unexpected match date format: ${value}`);
  }

  const [, month, day, year, hours, minutes] = match;

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
    ),
  );
}

export const gameStatusSchema = z.enum(["upcoming", "live", "finished"]);

export type GameStatus = z.infer<typeof gameStatusSchema>;

export const gameTypeSchema = z.enum([
  "group",
  "r32",
  "r16",
  "qf",
  "sf",
  "third",
  "final",
]);

export type GameType = z.infer<typeof gameTypeSchema>;

const rawGameSchema = z.object({
  away_score: numericString,
  away_scorers: nullableString,
  // Knockout matches use 0 until the bracket team is determined.
  away_team_id: numericString,
  away_team_label: z.string().optional(),
  away_team_name_en: z.string().optional(),
  away_team_name_fa: z.string().optional(),
  finished: stringBoolean,
  group: z.string(),
  home_score: numericString,
  home_scorers: nullableString,
  home_team_id: numericString,
  home_team_label: z.string().optional(),
  home_team_name_en: z.string().optional(),
  home_team_name_fa: z.string().optional(),
  id: numericString,
  local_date: z.string(),
  matchday: numericString,
  persian_date: z.string(),
  stadium_id: numericString,
  time_elapsed: z.string(),
  type: gameTypeSchema,
});

type RawGame = z.infer<typeof rawGameSchema>;

function parseGameStatus(raw: RawGame): GameStatus {
  if (raw.finished) {
    return "finished";
  }

  if (raw.time_elapsed !== "notstarted") {
    return "live";
  }

  return "upcoming";
}

export const gameSchema = rawGameSchema.transform((raw) => ({
  awayScore: raw.away_score,
  awayScorers: raw.away_scorers,
  awayTeamId: raw.away_team_id === 0 ? null : raw.away_team_id,
  awayTeamLabel: raw.away_team_label ?? null,
  awayTeamName: raw.away_team_name_en ?? null,
  finished: raw.finished,
  group: raw.group,
  homeScore: raw.home_score,
  homeScorers: raw.home_scorers,
  homeTeamId: raw.home_team_id === 0 ? null : raw.home_team_id,
  homeTeamLabel: raw.home_team_label ?? null,
  homeTeamName: raw.home_team_name_en ?? null,
  id: raw.id,
  kickoff: parseLocalDate(raw.local_date),
  localDate: raw.local_date,
  matchday: raw.matchday,
  stadiumId: raw.stadium_id,
  status: parseGameStatus(raw),
  timeElapsed: raw.time_elapsed,
  type: raw.type,
}));

export type Game = z.infer<typeof gameSchema>;

const rawTeamSchema = z.object({
  fifa_code: z.string(),
  flag: z.string(),
  groups: z.string(),
  id: numericString,
  iso2: z.string(),
  name_en: z.string(),
  name_fa: z.string(),
});

export const teamSchema = rawTeamSchema.transform((raw) => ({
  fifaCode: raw.fifa_code,
  flag: raw.flag,
  group: raw.groups,
  id: raw.id,
  iso2: raw.iso2,
  name: raw.name_en,
}));

export type Team = z.infer<typeof teamSchema>;

const rawGroupStandingSchema = z.object({
  d: numericString,
  ga: numericString,
  gd: numericString,
  gf: numericString,
  l: numericString,
  mp: numericString,
  pts: numericString,
  team_id: numericString,
  w: numericString,
});

const rawGroupSchema = z.object({
  name: z.string(),
  teams: z.array(rawGroupStandingSchema),
});

export const groupSchema = rawGroupSchema.transform((raw) => ({
  name: raw.name,
  standings: raw.teams.map((entry) => ({
    drawn: entry.d,
    goalDifference: entry.gd,
    goalsAgainst: entry.ga,
    goalsFor: entry.gf,
    lost: entry.l,
    played: entry.mp,
    points: entry.pts,
    teamId: entry.team_id,
    won: entry.w,
  })),
}));

export type Group = z.infer<typeof groupSchema>;

export type GroupStanding = Group["standings"][number];

const rawStadiumSchema = z.object({
  capacity: z.number(),
  city_en: z.string(),
  country_en: z.string(),
  fifa_name: z.string(),
  id: numericString,
  name_en: z.string(),
  region: z.string().optional(),
});

export const stadiumSchema = rawStadiumSchema.transform((raw) => ({
  capacity: raw.capacity,
  city: raw.city_en,
  country: raw.country_en,
  fifaName: raw.fifa_name,
  id: raw.id,
  name: raw.name_en,
}));

export type Stadium = z.infer<typeof stadiumSchema>;

export const gamesResponseSchema = z.object({
  games: z.array(gameSchema),
});

export const teamsResponseSchema = z.object({
  teams: z.array(teamSchema),
});

export const groupsResponseSchema = z.object({
  groups: z.array(groupSchema),
});

export const stadiumsResponseSchema = z.object({
  stadiums: z.array(stadiumSchema),
});
