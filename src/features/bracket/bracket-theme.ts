import { createTheme } from "@g-loot/react-tournament-brackets";

export const BRACKET_CANVAS_BACKGROUND = "var(--background)";

export const bracketTheme = createTheme({
  border: {
    color: "var(--border)",
    highlightedColor: "var(--primary)",
  },
  canvasBackground: BRACKET_CANVAS_BACKGROUND,
  matchBackground: {
    lostColor: "var(--card)",
    wonColor: "var(--card)",
  },
  roundHeaders: {
    background: "transparent",
  },
  score: {
    background: {
      lostColor: "#18181b",
      wonColor: "#18181b",
    },
    text: {
      highlightedLostColor: "#a1a1aa",
      highlightedWonColor: "#c4b5fd",
    },
  },
  textColor: {
    dark: "#71717a",
    disabled: "var(--muted-foreground)",
    highlighted: "var(--foreground)",
    main: "#e4e4e7",
  },
});

const BRACKET_ROUND_LABELS = [
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Final",
] as const;

/** Keep in sync with `BracketMatchNode` (border + p-2 + badge + gaps + two team rows). */
export const BRACKET_MATCH_BOX_HEIGHT = 117;

export const BRACKET_VIEW_OPTIONS = {
  style: {
    boxHeight: BRACKET_MATCH_BOX_HEIGHT,
    connectorColor: "var(--border)",
    connectorColorHighlight: "var(--primary)",
    roundHeader: {
      backgroundColor: "transparent",
      fontColor: "var(--muted-foreground)",
      fontSize: 11,
      isShown: true,
      marginBottom: 16,
      roundTextGenerator: (currentRoundNumber: number) => {
        if (currentRoundNumber === BRACKET_ROUND_LABELS.length) {
          return;
        }

        return BRACKET_ROUND_LABELS[currentRoundNumber - 1];
      },
    },
    spaceBetweenColumns: 24,
    spaceBetweenRows: 12,
    width: 224,
  },
} as const;
