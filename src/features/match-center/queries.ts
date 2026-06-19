import { queryOptions } from "@tanstack/react-query";

import {
  getLeaderboard,
  getMyPredictions,
} from "@/features/predictions/functions";

export const myPredictionsQueryOptions = queryOptions({
  queryFn: () => getMyPredictions(),
  queryKey: ["predictions", "mine"],
});

export const leaderboardQueryOptions = queryOptions({
  queryFn: () => getLeaderboard(),
  queryKey: ["predictions", "leaderboard"],
});
