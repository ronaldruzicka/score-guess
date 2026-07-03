import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";
import type { TeamMatchResult } from "@/features/match-center/build-matches";

import { Badge } from "@/components/ui/badge";

const matchResultBadgeVariants = new Map<
  TeamMatchResult["result"],
  VariantProps<typeof badgeVariants>["variant"]
>([
  ["D", "warning"],
  ["L", "destructive"],
  ["W", "success"],
]);

export function MatchResultBadge({
  result,
}: {
  readonly result: TeamMatchResult["result"];
}) {
  return (
    <Badge
      className="size-6 rounded-sm text-xs"
      variant={matchResultBadgeVariants.get(result)}
    >
      {result}
    </Badge>
  );
}
