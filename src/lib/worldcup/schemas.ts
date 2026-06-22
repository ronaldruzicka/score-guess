import { z } from "zod";

import { STADIUM_TIMEZONE_BY_ID } from "./stadium-timezones";

/**
 * The worldcup26.ir API returns nearly everything as strings
 * ("home_score": "0", "finished": "FALSE", unplayed scores: "null"), so these
 * schemas coerce raw payloads into clean, typed domain objects.
 */

const numericString = z.coerce.number();

/** The API uses "null" or empty strings for unplayed match scores. */
const scoreString = z.string().transform((value) => {
  if (value === "null" || value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
});

const stringBoolean = z
  .string()
  .transform((value) => value.toLowerCase() === "true");

/** The API uses the literal string "null" for missing scorer data. */
const nullableString = z
  .string()
  .transform((value) => (value === "null" ? null : value));

// Matches "06/11/2026 13:00" (MM/DD/YYYY HH:mm, stadium-local time).
const LOCAL_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/u;

function readDateTimePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): number {
  const value = parts.find((part) => part.type === type)?.value;
  const parsed = Number(value);

  if (type === "hour" && parsed === 24) {
    return 0;
  }

  return parsed;
}

/**
 * Converts the API's stadium-local kickoff string to a UTC instant using the
 * venue's IANA time zone (see {@link STADIUM_TIMEZONE_BY_ID}).
 */
function parseStadiumKickoff(localDate: string, stadiumId: number): Date {
  const timeZone = STADIUM_TIMEZONE_BY_ID[stadiumId];

  if (!timeZone) {
    throw new Error(`Unknown stadium timezone for id ${stadiumId}`);
  }

  const match = LOCAL_DATE_PATTERN.exec(localDate);

  if (!match) {
    throw new Error(`Unexpected match date format: ${localDate}`);
  }

  const [, month, day, year, hours, minutes] = match;
  const targetYear = Number(year);
  const targetMonth = Number(month);
  const targetDay = Number(day);
  const targetHour = Number(hours);
  const targetMinute = Number(minutes);

  let utc = Date.UTC(
    targetYear,
    targetMonth - 1,
    targetDay,
    targetHour,
    targetMinute,
  );

  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    hour12: false,
    minute: "numeric",
    month: "numeric",
    timeZone,
    year: "numeric",
  });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const parts = formatter.formatToParts(new Date(utc));
    const zonedMs = Date.UTC(
      readDateTimePart(parts, "year"),
      readDateTimePart(parts, "month") - 1,
      readDateTimePart(parts, "day"),
      readDateTimePart(parts, "hour"),
      readDateTimePart(parts, "minute"),
    );
    const targetMs = Date.UTC(
      targetYear,
      targetMonth - 1,
      targetDay,
      targetHour,
      targetMinute,
    );
    const diffMs = targetMs - zonedMs;

    if (diffMs === 0) {
      break;
    }

    utc += diffMs;
  }

  return new Date(utc);
}

export const timeElapsedSchema = z.enum(["upcoming", "live", "finished"]);

export type TimeElapsed = z.infer<typeof timeElapsedSchema>;

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
  away_score: scoreString,
  away_scorers: nullableString,
  // Knockout matches use 0 until the bracket team is determined.
  away_team_id: numericString,
  away_team_label: z.string().optional(),
  away_team_name_en: z.string().optional(),
  away_team_name_fa: z.string().optional(),
  finished: stringBoolean,
  group: z.string(),
  home_score: scoreString,
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

function parseTimeElapsed(raw: RawGame): TimeElapsed {
  if (raw.finished) {
    return "finished";
  }

  const elapsed = raw.time_elapsed.toLowerCase();

  if (elapsed === "notstarted") {
    return "upcoming";
  }

  return "live";
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
  kickoff: parseStadiumKickoff(raw.local_date, raw.stadium_id),
  localDate: raw.local_date,
  matchday: raw.matchday,
  stadiumId: raw.stadium_id,
  timeElapsed: parseTimeElapsed(raw),
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

/** Score pair shared by {@link Game} results and user predictions. */
export type MatchScore = Pick<Game, "awayScore" | "homeScore">;

/** Team row for match UI, derived from {@link Team}. */
export type MatchTeam = Pick<Team, "name"> & {
  flag: Team["flag"] | null;
};

/** Game enriched with resolved teams and optional user prediction. */
export type EnrichedMatch = {
  awayTeam: MatchTeam;
  game: Game;
  homeTeam: MatchTeam;
  points: number | null;
  prediction: MatchScore | null;
};

/** Upcoming matches grouped under a formatted kickoff date heading. */
export type MatchDay = {
  dateLabel: string;
  matches: EnrichedMatch[];
};
