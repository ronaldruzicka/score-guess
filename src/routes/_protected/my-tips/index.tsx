import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  leaderboardQueryOptions,
  myPredictionsQueryOptions,
} from "@/features/match-center/queries";
import { MyTipsView } from "@/features/my-tips/my-tips-view";
import { gamesQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";

function MyTipsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-2 h-5 w-80" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

function MyTipsError({
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
        <p>My tips are unavailable right now. Please try again later.</p>
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

export const Route = createFileRoute("/_protected/my-tips/")({
  component: MyTipsView,
  errorComponent: MyTipsError,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(gamesQueryOptions),
      context.queryClient.ensureQueryData(teamsQueryOptions),
      context.queryClient.ensureQueryData(myPredictionsQueryOptions),
      context.queryClient.ensureQueryData(leaderboardQueryOptions),
    ]);
  },
  pendingComponent: MyTipsSkeleton,
});
