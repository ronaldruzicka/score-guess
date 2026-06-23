import type { TimeElapsed } from "@/lib/worldcup/schemas";

import { cva } from "class-variance-authority";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<TimeElapsed, string> = {
  finished: "Finished",
  live: "Live",
  upcoming: "Upcoming",
};

const matchStatusBadgeVariants = cva("", {
  variants: {
    timeElapsed: {
      finished: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
      live: "bg-red-50 text-red-700 motion-safe:animate-live-badge-glow dark:bg-red-950 dark:text-red-300",
      upcoming: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    },
  },
});

export function MatchStatusBadge({
  className,
  timeElapsed,
}: {
  readonly className?: string;
  readonly timeElapsed: TimeElapsed;
}) {
  return (
    <Badge className={cn(matchStatusBadgeVariants({ timeElapsed }), className)}>
      {STATUS_LABEL[timeElapsed]}
    </Badge>
  );
}
