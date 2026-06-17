import { FootballIcon, Home03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const redCardMask = "/not-found/red-card-mask.svg";

function VarRedCard() {
  return (
    <div className="relative flex w-96 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-card p-2 shadow-2xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 -left-6 size-18 border-t-2 border-l-2 border-primary"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -bottom-6 size-18 border-r-2 border-b-2 border-primary"
      />

      <div className="flex w-full flex-col gap-9 py-9">
        <div className="flex justify-center">
          <div
            className="relative h-54 w-36 bg-destructive drop-shadow-[0_0_22px_rgba(239,68,68,0.4)]"
            style={{
              WebkitMaskImage: `url("${redCardMask}")`,
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "144px 216px",
              maskImage: `url("${redCardMask}")`,
              maskRepeat: "no-repeat",
              maskSize: "144px 216px",
            }}
          >
            <span className="absolute top-3 left-3 font-mono text-xs leading-4 text-[#1a0000] opacity-50">
              VAR_ERR_01
            </span>
            <span className="absolute right-3 bottom-3 font-mono text-xs leading-4 text-[#1a0000] opacity-50">
              OUT_OF_BOUNDS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  const { data: session } = authClient.useSession();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 md:p-12">
      <div className="flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-24">
        <div className="flex flex-1 justify-center">
          <VarRedCard />
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <div className="space-y-2">
            <p className="font-mono text-sm tracking-[0.2em] text-muted-foreground uppercase">
              SYSTEM_REPORT_ERROR
            </p>
            <h1 className="font-heading text-4xl font-black tracking-tight text-foreground uppercase sm:text-5xl lg:text-6xl lg:leading-none">
              404: Offside /
              <br />
              Match not
              <br />
              found.
            </h1>
          </div>

          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Looks like the referee blew the whistle early. This page has been{" "}
            <span className="text-primary">VAR-reviewed</span> and found to be
            non-existent. The goal has been disallowed.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              className={cn(buttonVariants({ size: "lg", variant: "default" }))}
              to="/"
            >
              <HugeiconsIcon icon={Home03Icon} strokeWidth={2} />
              Go home
            </Link>
            {session?.user ? (
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                )}
                to="/match-center"
              >
                <HugeiconsIcon icon={FootballIcon} strokeWidth={2} />
                Find next match
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
