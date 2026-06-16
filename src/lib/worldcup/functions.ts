import { createServerFn } from "@tanstack/react-start";

import { fetchGames, fetchGroups, fetchStadiums, fetchTeams } from "./api";

export const getGames = createServerFn({ method: "GET" }).handler(async () => {
  const { games } = await fetchGames();

  return games;
});

export const getTeams = createServerFn({ method: "GET" }).handler(async () => {
  const { teams } = await fetchTeams();

  return teams;
});

export const getGroups = createServerFn({ method: "GET" }).handler(async () => {
  const { groups } = await fetchGroups();

  return groups;
});

export const getStadiums = createServerFn({ method: "GET" }).handler(
  async () => {
    const { stadiums } = await fetchStadiums();

    return stadiums;
  },
);
