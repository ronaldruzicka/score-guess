import type { z } from "zod";

import { fAwait } from "@/lib/fawait";

import { FETCH_TIMEOUT, MINUTE, SECOND } from "./constants";
import {
  gamesResponseSchema,
  groupsResponseSchema,
  stadiumsResponseSchema,
  teamsResponseSchema,
} from "./schemas";

const API_BASE_URL = process.env.WORLDCUP_API_URL ?? "https://worldcup26.ir";

// Games change during live matches; the rest is effectively static.
const GAMES_TTL = 30 * SECOND;
const STATIC_TTL = 60 * MINUTE;

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

/**
 * Server-side in-module cache so a single upstream copy is shared across all
 * users, keeping us well under the API rate limit regardless of traffic.
 */
const cache = new Map<string, CacheEntry<unknown>>();

type FetchCachedOptions<TSchema extends z.ZodTypeAny> = {
  path: string;
  schema: TSchema;
  ttl: number;
};

function returnStale<T>(entry: CacheEntry<unknown> | undefined): T | null {
  if (!entry) {
    return null;
  }

  return entry.value as T;
}

function returnStaleOrThrow<T>(
  entry: CacheEntry<unknown> | undefined,
  error: unknown,
): T {
  const stale = returnStale<T>(entry);

  if (stale !== null) {
    return stale;
  }

  throw error;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

async function fetchCached<TSchema extends z.ZodTypeAny>({
  path,
  schema,
  ttl,
}: FetchCachedOptions<TSchema>): Promise<z.infer<TSchema>> {
  const now = Date.now();
  const cached = cache.get(path);

  if (cached && cached.expiresAt > now) {
    return cached.value as z.infer<TSchema>;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  const [error, response] = await fAwait(
    fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    }),
  );

  clearTimeout(timeoutId);

  if (error) {
    return returnStaleOrThrow(
      cached,
      isAbortError(error)
        ? new Error(`World Cup API request timed out: ${path}`, {
            cause: error,
          })
        : error,
    );
  }

  if (!response.ok) {
    return returnStaleOrThrow(
      cached,
      new Error(`World Cup API request failed: ${path} (${response.status})`),
    );
  }

  const [jsonError, json] = await fAwait(response.json());

  if (jsonError) {
    return returnStaleOrThrow(cached, jsonError);
  }

  const parseResult = schema.safeParse(json);

  if (!parseResult.success) {
    return returnStaleOrThrow(cached, parseResult.error);
  }

  cache.set(path, {
    expiresAt: Date.now() + ttl,
    value: parseResult.data,
  });

  return parseResult.data;
}

export function fetchGames() {
  return fetchCached({
    path: "/get/games",
    schema: gamesResponseSchema,
    ttl: GAMES_TTL,
  });
}

export function fetchTeams() {
  return fetchCached({
    path: "/get/teams",
    schema: teamsResponseSchema,
    ttl: STATIC_TTL,
  });
}

export function fetchGroups() {
  return fetchCached({
    path: "/get/groups",
    schema: groupsResponseSchema,
    ttl: STATIC_TTL,
  });
}

export function fetchStadiums() {
  return fetchCached({
    path: "/get/stadiums",
    schema: stadiumsResponseSchema,
    ttl: STATIC_TTL,
  });
}
