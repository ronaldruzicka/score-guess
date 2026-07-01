import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BracketView } from "@/features/bracket/bracket-view";
import { myPredictionsQueryOptions } from "@/features/match-center/queries";
import { gamesQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";

const SKELETON_ROUNDS = ["R32", "R16", "QF", "SF", "Final"];
const SKELETON_MATCHES = [0, 1, 2];

function BracketSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {SKELETON_ROUNDS.map((round) => (
          <div key={round} className="flex min-w-56 flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            {SKELETON_MATCHES.map((match) => (
              <Skeleton key={match} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketError({
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
        <p>The knockout bracket is unavailable right now. Please try again later.</p>
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

export const Route = createFileRoute("/_protected/bracket/")({
  component: BracketView,
  errorComponent: BracketError,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(gamesQueryOptions),
      context.queryClient.ensureQueryData(teamsQueryOptions),
      context.queryClient.ensureQueryData(myPredictionsQueryOptions),
    ]);
  },
  pendingComponent: BracketSkeleton,
});
