import { queryOptions } from "@tanstack/react-query";

import {
  getLeaderboard,
  getMyPredictions,
} from "@/features/predictions/functions";

export const myPredictionsQueryOptions = queryOptions({
  queryFn: async () => await getMyPredictions(),
  queryKey: ["predictions", "mine"],
});

export const leaderboardQueryOptions = queryOptions({
  queryFn: async () => await getLeaderboard(),
  queryKey: ["predictions", "leaderboard"],
});
