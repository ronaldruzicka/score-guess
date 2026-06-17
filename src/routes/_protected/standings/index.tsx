import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buildGroupStandings } from "@/features/standings/build-standings";
import { StandingsTable } from "@/features/standings/standings-table";
import { groupsQueryOptions, teamsQueryOptions } from "@/lib/worldcup/queries";

const SKELETON_GROUPS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

const SKELETON_ROWS = [0, 1, 2, 3];

function StandingsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {SKELETON_GROUPS.map((group) => (
        <Card key={group} size="sm">
          <CardHeader>
            <CardTitle>Group {group}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {SKELETON_ROWS.map((row) => (
              <Skeleton key={row} className="h-8 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RouteComponent() {
  const { data: groups } = useSuspenseQuery(groupsQueryOptions);
  const { data: teams } = useSuspenseQuery(teamsQueryOptions);

  const standings = buildGroupStandings(groups, teams);

  return (
    <div className="@container/standings flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Group Standings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live group tables, sorted by points.
        </p>
      </div>
      <div className="grid gap-5 @xl/standings:grid-cols-2 @4xl/standings:grid-cols-3">
        {standings.map((group) => (
          <Card key={group.name} size="sm" className="gap-1! py-0!">
            <CardHeader className="bg-muted py-3">
              <CardTitle>Group {group.name}</CardTitle>
            </CardHeader>
            <CardContent className="px-0!">
              <StandingsTable rows={group.rows} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StandingsError({ error }: { readonly error: Error }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        Standings are unavailable right now. Please try again later.
        {import.meta.env.DEV ? (
          <p className="mt-2 text-xs text-destructive">{error.message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_protected/standings/")({
  component: RouteComponent,
  errorComponent: StandingsError,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(groupsQueryOptions),
      context.queryClient.ensureQueryData(teamsQueryOptions),
    ]);
  },
  pendingComponent: StandingsSkeleton,
});
