declare module "@g-loot/react-tournament-brackets" {
  import type { MouseEvent, ReactElement } from "react";

  export type ParticipantType = {
    id: string | number;
    isWinner: boolean;
    name: string;
    resultText: string | null;
    status: "NO_PARTY" | "NO_SHOW" | "PLAYED" | "WALK_OVER" | null;
  };

  /** Single-elimination `matches` item shape. */
  export type MatchType = {
    id: number | string;
    name: string;
    nextMatchId: number | string | null;
    participants: ParticipantType[];
    startTime: string;
    state: "DONE" | "NO_PARTY" | "NO_SHOW" | "SCORE_DONE";
    tournamentRoundText: string;
  };

  export type OptionsType = {
    boxHeight?: number;
    canvasPadding?: number;
    connectorColor?: string;
    connectorColorHighlight?: string;
    horizontalOffset?: number;
    lineInfo?: {
      homeVisitorSpread?: number;
      separation?: number;
    };
    lostByNoShowText?: string;
    roundHeader?: {
      backgroundColor?: string;
      fontColor?: string;
      fontFamily?: string;
      fontSize?: number;
      height?: number;
      isShown?: boolean;
      marginBottom?: number;
      roundTextGenerator?: (
        currentRoundNumber: number,
        roundsTotalNumber: number,
      ) => string | undefined;
    };
    roundSeparatorWidth?: number;
    spaceBetweenColumns?: number;
    spaceBetweenRows?: number;
    width?: number;
    wonBywalkOverText?: string;
  };

  export type ComputedOptionsType = OptionsType & {
    columnWidth?: number;
    rowHeight?: number;
  };

  export type ThemeType = {
    border: {
      color: string;
      highlightedColor: string;
    };
    canvasBackground: string;
    disabledColor: string;
    fontFamily: string;
    matchBackground: {
      lostColor: string;
      wonColor: string;
    };
    roundHeaders: {
      background: string;
    };
    score: {
      background: {
        lostColor: string;
        wonColor: string;
      };
      text: {
        highlightedLostColor: string;
        highlightedWonColor: string;
      };
    };
    textColor: {
      dark: string;
      disabled: string;
      highlighted: string;
      main: string;
    };
    transitionTimingFunction: string;
  };

  export type MatchComponentProps = {
    bottomHovered: boolean;
    bottomParty: ParticipantType;
    bottomText: string;
    bottomWon: boolean;
    computedStyles?: ComputedOptionsType;
    connectorColor?: string;
    match: MatchType;
    onMatchClick: (args: {
      bottomWon: boolean;
      event: MouseEvent<HTMLAnchorElement>;
      match: MatchType;
      topWon: boolean;
    }) => void;
    onMouseEnter: (partyId: string | number) => void;
    onMouseLeave: () => void;
    onPartyClick: (party: ParticipantType, partyWon: boolean) => void;
    resultFallback: (participant: ParticipantType) => string;
    teamNameFallback: string;
    topHovered: boolean;
    topParty: ParticipantType;
    topText: string;
    topWon: boolean;
  };

  export type SingleElimLeaderboardProps = {
    currentRound?: string;
    matchComponent: (props: MatchComponentProps) => ReactElement;
    matches: MatchType[];
    onMatchClick?: (args: {
      bottomWon: boolean;
      match: MatchType;
      topWon: boolean;
    }) => void;
    onPartyClick?: (party: ParticipantType, partyWon: boolean) => void;
    options?: {
      style: OptionsType;
    };
    svgWrapper?: (props: {
      bracketHeight: number;
      bracketWidth: number;
      children: ReactElement;
      startAt: number[];
    }) => ReactElement;
    theme?: ThemeType;
  };

  export type SvgViewerProps = {
    SVGBackground?: string;
    background?: string;
    bracketHeight: number;
    bracketWidth: number;
    children: ReactElement;
    height: number;
    scaleFactor?: number;
    startAt?: number[];
    width: number;
  };

  export const MATCH_STATES: Record<string, string>;

  export function createTheme(customTheme?: Partial<ThemeType>): ThemeType;

  export function Match(props: MatchComponentProps): ReactElement;

  export function SingleEliminationBracket(
    props: SingleElimLeaderboardProps,
  ): ReactElement;

  export function SVGViewer(props: SvgViewerProps): ReactElement;
}
