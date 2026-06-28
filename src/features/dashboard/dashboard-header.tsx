import { Badge } from "@/components/ui/badge";

export function DashboardHeader({
  lockingCount,
  tournamentPhase,
  userName,
}: {
  readonly lockingCount: number;
  readonly tournamentPhase: string;
  readonly userName: string;
}) {
  const lockMessage =
    lockingCount > 0
      ? `${lockingCount} match${lockingCount === 1 ? "" : "es"} lock in the next 24 hours`
      : "No predictions due in the next 24 hours";

  return (
    <header className="flex flex-col gap-3 border-b border-border pb-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-black tracking-tight">
          Welcome back, {userName}
        </h1>
        <Badge
          className="text-[10px] font-bold tracking-wide uppercase"
          variant="outline"
        >
          {tournamentPhase}
        </Badge>
      </div>
      <p className="text-base text-muted-foreground">{lockMessage}</p>
    </header>
  );
}
