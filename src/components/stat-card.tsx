import type { IconSvgElement } from "@hugeicons/react";

import { HugeiconsIcon } from "@hugeicons/react";
import { cva } from "class-variance-authority";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly icon?: IconSvgElement;
};

export function StatCard({ children, className, icon }: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative min-h-[162px] overflow-hidden border-border bg-card py-0 ring-0",
        className,
      )}
    >
      {icon ? (
        <HugeiconsIcon
          className="pointer-events-none absolute top-0 right-0 size-20 text-muted-foreground/10"
          icon={icon}
          strokeWidth={1.5}
        />
      ) : null}
      {children}
    </Card>
  );
}

export type StatCardHeaderProps = {
  readonly children: React.ReactNode;
  readonly className?: string;
};

export function StatCardHeader({ children, className }: StatCardHeaderProps) {
  return (
    <CardHeader className={cn("relative px-6 pt-6", className)}>
      <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {children}
      </p>
    </CardHeader>
  );
}

export type StatCardContentProps = {
  readonly children: React.ReactNode;
  readonly className?: string;
};

export function StatCardContent({ children, className }: StatCardContentProps) {
  return (
    <CardContent
      className={cn("relative flex flex-1 flex-col gap-1 px-6", className)}
    >
      {children}
    </CardContent>
  );
}

export type StatCardValueProps = {
  readonly children: React.ReactNode;
  readonly className?: string;
};

export function StatCardValue({ children, className }: StatCardValueProps) {
  return (
    <p
      className={cn(
        "font-heading text-4xl leading-10 font-black tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

const footerVariants = cva(
  "relative flex items-center gap-1 border-t-0 px-6 pt-0 pb-6",
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

export type StatCardFooterProps = {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly color?: "default" | "primary" | "success";
};

export function StatCardFooter({
  children,
  className,
  color = "default",
}: StatCardFooterProps) {
  return (
    <CardFooter className={cn(footerVariants({ color }), className)}>
      {children}
    </CardFooter>
  );
}
