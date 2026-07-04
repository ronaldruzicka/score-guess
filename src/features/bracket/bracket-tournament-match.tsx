import type { MatchComponentProps } from "@g-loot/react-tournament-brackets";

import { useBracketEnrichedMatch } from "./bracket-match-lookup";
import { BracketMatchNode } from "./bracket-match-node";
import { BRACKET_MATCH_BOX_HEIGHT } from "./bracket-theme";
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
  computedStyles,
  match,
  onMouseEnter,
  onMouseLeave,
  topHovered,
  topParty,
}: MatchComponentProps) {
  const enrichedMatch = useBracketEnrichedMatch(match.id);
  const boxHeight = computedStyles?.boxHeight ?? BRACKET_MATCH_BOX_HEIGHT;
  const matchSlotStyle = { height: boxHeight, width: "100%" } as const;

  if (!enrichedMatch) {
    return <div aria-hidden style={matchSlotStyle} />;
  }

  return (
    <div style={matchSlotStyle}>
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
