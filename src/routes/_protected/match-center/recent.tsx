import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { myPredictionsQueryOptions } from "@/features/match-center/queries";
import { RecentMatchesView } from "@/features/match-center/recent-matches-view";
import { gamesQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";

function RecentMatchesSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border-b border-border pb-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-11 w-full max-w-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function RecentMatchesError({
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
        <p>Recent matches are unavailable right now. Please try again later.</p>
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

export const Route = createFileRoute("/_protected/match-center/recent")({
  component: RecentMatchesView,
  errorComponent: RecentMatchesError,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(gamesQueryOptions),
      context.queryClient.ensureQueryData(teamsQueryOptions),
      context.queryClient.ensureQueryData(myPredictionsQueryOptions),
    ]);
  },
  pendingComponent: RecentMatchesSkeleton,
});
