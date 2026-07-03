import type { MatchComponentProps } from "@g-loot/react-tournament-brackets";

import { useBracketEnrichedMatch } from "./bracket-match-lookup";
import { BracketMatchNode } from "./bracket-match-node";
import { getParticipantId } from "./build-single-elimination-matches";

function resolveTeamSide({
  enrichedMatch,
  partyId,
}: {
  enrichedMatch: NonNullable<ReturnType<typeof useBracketEnrichedMatch>>;
  partyId: string | number;
}): "away" | "home" {
  if (partyId === getParticipantId(enrichedMatch, "home")) {
    return "home";
  }

  return "away";
}

export function BracketTournamentMatch({
  bottomHovered,
  bottomParty,
  match,
  onMouseEnter,
  onMouseLeave,
  topHovered,
  topParty,
}: MatchComponentProps) {
  const enrichedMatch = useBracketEnrichedMatch(match.id);

  if (!enrichedMatch) {
    return <div aria-hidden className="h-full w-full" />;
  }

  return (
    <div className="h-full w-full">
      <BracketMatchNode
        match={enrichedMatch}
        rows={[
          {
            hovered: topHovered,
            onMouseEnter: () => {
              onMouseEnter(topParty.id);
            },
            onMouseLeave,
            side: resolveTeamSide({
              enrichedMatch,
              partyId: topParty.id,
            }),
          },
          {
            hovered: bottomHovered,
            onMouseEnter: () => {
              onMouseEnter(bottomParty.id);
            },
            onMouseLeave,
            side: resolveTeamSide({
              enrichedMatch,
              partyId: bottomParty.id,
            }),
          },
        ]}
      />
    </div>
  );
}
