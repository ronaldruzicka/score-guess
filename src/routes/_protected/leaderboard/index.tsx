import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardPodium } from "@/features/leaderboard/leaderboard-podium";
import { LeaderboardTable } from "@/features/leaderboard/leaderboard-table";
import { leaderboardQueryOptions } from "@/features/match-center/queries";
import { Route as ProtectedRoute } from "@/routes/_protected/route";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 px-0 py-4">
          {SKELETON_ROWS.map((row) => (
            <Skeleton key={row} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RouteComponent() {
  const { user } = ProtectedRoute.useRouteContext();
  const { data: entries } = useSuspenseQuery(leaderboardQueryOptions);

  return (
    <div className="@container/leaderboard flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Leaderboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rankings from finished matches. Exact score earns 3 points; correct
          outcome earns 1 point.
        </p>
      </div>

      <LeaderboardPodium currentUserId={user.id} entries={entries} />

      <Card className="overflow-hidden border-border/80 bg-card/80 py-0 backdrop-blur-sm">
        <CardContent className="px-0">
          <LeaderboardTable currentUserId={user.id} rows={entries} />
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardError({ error }: { readonly error: Error }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        Leaderboard is unavailable right now. Please try again later.
        {import.meta.env.DEV ? (
          <p className="mt-2 text-xs text-destructive">{error.message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_protected/leaderboard/")({
  component: RouteComponent,
  errorComponent: LeaderboardError,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(leaderboardQueryOptions);
  },
  pendingComponent: LeaderboardSkeleton,
});
