import type { BracketRound } from "./build-bracket";

import { BracketMatchNode } from "./bracket-match-node";

export function BracketRoundColumn({
  round,
}: {
  readonly round: BracketRound;
}) {
  return (
    <section className="flex min-w-56 flex-1 flex-col gap-3">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/90 pb-2 backdrop-blur-sm">
        <h2 className="font-heading text-sm font-bold tracking-tight">
          {round.label}
        </h2>
        <p className="text-[11px] text-muted-foreground">{round.subtitle}</p>
      </header>
      {round.matches.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          No matches scheduled yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {round.matches.map((match) => (
            <BracketMatchNode key={match.game.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}
