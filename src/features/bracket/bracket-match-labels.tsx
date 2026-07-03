import type { EnrichedMatch } from "@/features/match-center/build-matches";

import { ChampionIcon, MedalThirdPlaceIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { BracketMatchNode } from "./bracket-match-node";

const FINAL_LABEL_ICON_SIZE = 18;
const THIRD_PLACE_LABEL_ICON_SIZE = 12;

export function FinalMatchLabel() {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
      <HugeiconsIcon
        aria-hidden
        className="text-primary"
        icon={ChampionIcon}
        strokeWidth={2}
        size={FINAL_LABEL_ICON_SIZE}
      />
      Final
    </h2>
  );
}

export function ThirdPlaceMatchLabel() {
  return (
    <h2 className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
      <HugeiconsIcon
        aria-hidden
        className="text-primary"
        icon={MedalThirdPlaceIcon}
        strokeWidth={2}
        size={THIRD_PLACE_LABEL_ICON_SIZE}
      />
      Third place
    </h2>
  );
}

export function ThirdPlaceMatchSection({
  match,
}: {
  readonly match: EnrichedMatch;
}) {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <ThirdPlaceMatchLabel />
      </header>
      <BracketMatchNode match={match} />
    </section>
  );
}
