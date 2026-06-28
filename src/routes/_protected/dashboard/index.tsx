import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import {
  leaderboardQueryOptions,
  myPredictionsQueryOptions,
} from "@/features/match-center/queries";
import {
  gamesQueryOptions,
  groupsQueryOptions,
  teamsQueryOptions,
} from "@/lib/worldcup/queries";

function DashboardSkeleton() {
  return (
    <div className="grid gap-8 xl:grid-cols-12">
      <div className="flex flex-col gap-8 xl:col-span-8">
        <div className="flex flex-col gap-3 border-b border-border pb-4">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-56" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
      <div className="xl:col-span-4">
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}

function DashboardError({
  error,
  reset,
}: {
  readonly error: Error;
  readonly reset: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = async () => {
    setIsRetrying(true);

    try {
      await Promise.all([
        queryClient.resetQueries({ queryKey: ["worldcup"] }),
        queryClient.resetQueries({
          queryKey: myPredictionsQueryOptions.queryKey,
        }),
        queryClient.resetQueries({
          queryKey: leaderboardQueryOptions.queryKey,
        }),
      ]);
      await router.invalidate();
      reset();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center text-muted-foreground">
        <p>Dashboard is unavailable right now. Please try again later.</p>
        {import.meta.env.DEV ? (
          <p className="text-xs text-destructive">{error.message}</p>
        ) : null}
        <Button
          disabled={isRetrying}
          onClick={() => {
            void retry();
          }}
          type="button"
          variant="outline"
        >
          {isRetrying ? "Retrying…" : "Try again"}
        </Button>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_protected/dashboard/")({
  component: DashboardView,
  errorComponent: DashboardError,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(gamesQueryOptions),
      context.queryClient.ensureQueryData(teamsQueryOptions),
      context.queryClient.ensureQueryData(groupsQueryOptions),
      context.queryClient.ensureQueryData(myPredictionsQueryOptions),
      context.queryClient.ensureQueryData(leaderboardQueryOptions),
    ]);
  },
  pendingComponent: DashboardSkeleton,
});
