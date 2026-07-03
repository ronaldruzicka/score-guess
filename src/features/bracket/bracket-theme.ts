import { createTheme } from "@g-loot/react-tournament-brackets";

export const BRACKET_CANVAS_BACKGROUND = "var(--background)";

export const bracketTheme = createTheme({
  border: {
    color: "#27272a",
    highlightedColor: "#a78bfa",
  },
  canvasBackground: BRACKET_CANVAS_BACKGROUND,
  matchBackground: {
    lostColor: "#121215",
    wonColor: "#121215",
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
    disabled: "#52525b",
    highlighted: "#fafafa",
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

export const BRACKET_VIEW_OPTIONS = {
  style: {
    boxHeight: 152,
    connectorColor: "#3f3f46",
    connectorColorHighlight: "#a78bfa",
    roundHeader: {
      backgroundColor: "transparent",
      fontColor: "#a1a1aa",
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
    spaceBetweenRows: 16,
    width: 224,
  },
} as const;
