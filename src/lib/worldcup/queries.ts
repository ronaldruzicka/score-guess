import type { Game } from "./schemas";

import { queryOptions } from "@tanstack/react-query";

import { MINUTE, SECOND } from "./constants";
import { getGames, getGroups, getStadiums, getTeams } from "./functions";

// Poll fast while a match is in progress, slowly otherwise.
const LIVE_REFETCH_INTERVAL = 30 * SECOND;
const IDLE_REFETCH_INTERVAL = 5 * MINUTE;

function hasLiveGame(games: Game[]): boolean {
  return games.some((game) => game.timeElapsed === "live");
}

export const gamesQueryOptions = queryOptions({
  queryFn: async () => await getGames(),
  queryKey: ["worldcup", "games"],
  refetchInterval: (query) => {
    const games = query.state.data;

    if (games && hasLiveGame(games)) {
      return LIVE_REFETCH_INTERVAL;
    }

    return IDLE_REFETCH_INTERVAL;
  },
  staleTime: LIVE_REFETCH_INTERVAL,
});

export const teamsQueryOptions = queryOptions({
  queryFn: async () => await getTeams(),
  queryKey: ["worldcup", "teams"],
  staleTime: 60 * MINUTE,
});

export const groupsQueryOptions = queryOptions({
  queryFn: async () => await getGroups(),
  queryKey: ["worldcup", "groups"],
  staleTime: 10 * MINUTE,
});

export const stadiumsQueryOptions = queryOptions({
  queryFn: async () => await getStadiums(),
  queryKey: ["worldcup", "stadiums"],
  staleTime: 60 * MINUTE,
});
