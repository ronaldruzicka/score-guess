import { cva } from "class-variance-authority";

import { Badge } from "@/components/ui/badge";
import { POINTS_EXACT, POINTS_OUTCOME } from "@/features/predictions/scoring";

type PointsResult = "exact" | "miss" | "outcome";

function getPointsResult(points: number): PointsResult {
  if (points === POINTS_EXACT) {
    return "exact";
  }

  if (points === POINTS_OUTCOME) {
    return "outcome";
  }

  return "miss";
}

const pointsBadgeVariants = cva("border text-[10px] font-black tracking-wide", {
  variants: {
    result: {
      exact: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
      miss: "border-border bg-neutral-800 text-muted-foreground",
      outcome: "border-primary/20 bg-primary/10 text-primary",
    } satisfies Record<PointsResult, string>,
  },
});

export function PointsBadge({ points }: { readonly points: number }) {
  return (
    <Badge className={pointsBadgeVariants({ result: getPointsResult(points) })}>
      {points > 0 ? `+${points} PTS` : "0 PTS"}
    </Badge>
  );
}
