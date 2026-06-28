import type { IconSvgElement } from "@hugeicons/react";

import { HugeiconsIcon } from "@hugeicons/react";
import { cva } from "class-variance-authority";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { Show } from "./show";

const statCardSubtextVariants = cva(
  "flex items-center gap-1 pt-1 text-xs tracking-wide",
  {
    defaultVariants: {
      color: "default",
    },
    variants: {
      color: {
        default: "text-muted-foreground",
        primary: "text-primary",
        success: "text-emerald-500",
      },
    },
  },
);

type StatCardSubtextProps = {
  readonly children: React.ReactNode | undefined;
  readonly className?: string;
  readonly color?: "default" | "primary" | "success";
};

function StatCardSubtext({
  children,
  className,
  color = "default",
}: StatCardSubtextProps) {
  return (
    <Show when={!!children}>
      <p className={cn(statCardSubtextVariants({ color }), className)}>
        {children}
      </p>
    </Show>
  );
}

export type StatCardProps = {
  readonly children?: React.ReactNode;
  readonly icon?: IconSvgElement;
  readonly label: string;
  readonly value: string;
};

export function StatCard({ children, icon, label, value }: StatCardProps) {
  return (
    <Card className="relative min-h-[162px] overflow-hidden border-border bg-card py-0 ring-0">
      {icon ? (
        <HugeiconsIcon
          className="pointer-events-none absolute top-0 right-0 size-20 text-muted-foreground/10"
          icon={icon}
          strokeWidth={1.5}
        />
      ) : null}
      <CardContent className="relative flex h-full flex-col justify-between gap-1 p-6">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className="font-heading text-4xl leading-10 font-black tracking-tight text-foreground">
          {value}
        </p>
        {children}
      </CardContent>
    </Card>
  );
}

StatCard.Subtext = StatCardSubtext;
