import type { SingleEliminationMatch } from "./single-elimination-match";

import {
  BRACKET_MATCH_BOX_HEIGHT,
  BRACKET_VIEW_OPTIONS,
} from "./bracket-theme";

const CANVAS_PADDING = 25;
const DEFAULT_ROUND_HEADER_HEIGHT = 40;
const FINAL_MATCH_LABEL_HEIGHT = 28;
const FINAL_MATCH_LABEL_GAP = 10;
const FINAL_TO_THIRD_PLACE_GAP = 24;
const THIRD_PLACE_LABEL_HEIGHT = 20;
const THIRD_PLACE_SECTION_GAP = 12;

export type BracketOverlayPosition = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type BracketLayoutStyles = {
  boxHeight: number;
  canvasPadding: number;
  columnWidth: number;
  roundHeader: {
    height: number;
    isShown: boolean;
    marginBottom: number;
  };
  rowHeight: number;
  width: number;
};

function getBracketLayoutStyles(): BracketLayoutStyles {
  const {
    boxHeight,
    roundHeader,
    spaceBetweenColumns,
    spaceBetweenRows,
    width,
  } = BRACKET_VIEW_OPTIONS.style;

  return {
    boxHeight,
    canvasPadding: CANVAS_PADDING,
    columnWidth: width + spaceBetweenColumns,
    roundHeader: {
      height: DEFAULT_ROUND_HEADER_HEIGHT,
      isShown: roundHeader?.isShown ?? true,
      marginBottom: roundHeader?.marginBottom ?? 0,
    },
    rowHeight: boxHeight + spaceBetweenRows,
    width,
  };
}

function calculateVerticalPositioning({
  columnIndex,
  rowHeight,
  rowIndex,
}: {
  columnIndex: number;
  rowHeight: number;
  rowIndex: number;
}): number {
  const verticalStartingPoint =
    2 ** columnIndex * (rowHeight / 2) - rowHeight / 2;
  const heightIncrease = 2 ** columnIndex * rowHeight * rowIndex;

  return heightIncrease + verticalStartingPoint;
}

export function getBracketColumnCount(
  matches: SingleEliminationMatch[],
): number {
  const lastGame = matches.find((match) => match.nextMatchId === null);

  if (!lastGame) {
    return 0;
  }

  const generateColumn = (
    matchesColumn: SingleEliminationMatch[],
  ): SingleEliminationMatch[][] => {
    const previousMatchesColumn: SingleEliminationMatch[] = [];

    for (const match of matchesColumn) {
      const feederMatches = matches
        .filter((candidate) => candidate.nextMatchId === match.id)
        .toSorted((left, right) =>
          left.name.localeCompare(right.name, undefined, { numeric: true }),
        );

      previousMatchesColumn.push(...feederMatches);
    }

    if (previousMatchesColumn.length > 0) {
      return [...generateColumn(previousMatchesColumn), previousMatchesColumn];
    }

    return [previousMatchesColumn];
  };

  const columns = [...generateColumn([lastGame]), [lastGame]].filter(
    (column) => column.length > 0,
  );

  return columns.length;
}

export function getFinalMatchPosition(columnCount: number): {
  matchHeight: number;
  width: number;
  x: number;
  y: number;
} {
  const styles = getBracketLayoutStyles();
  const columnIndex = Math.max(columnCount - 1, 0);
  const roundHeaderOffset = styles.roundHeader.isShown
    ? styles.roundHeader.height + styles.roundHeader.marginBottom
    : 0;

  return {
    matchHeight: styles.boxHeight,
    width: styles.width,
    x: columnIndex * styles.columnWidth + styles.canvasPadding,
    y:
      calculateVerticalPositioning({
        columnIndex,
        rowHeight: styles.rowHeight,
        rowIndex: 0,
      }) +
      styles.canvasPadding +
      roundHeaderOffset,
  };
}

export function getFinalMatchLabelPosition(
  columnCount: number,
): BracketOverlayPosition {
  const finalPosition = getFinalMatchPosition(columnCount);

  return {
    height: FINAL_MATCH_LABEL_HEIGHT,
    width: finalPosition.width,
    x: finalPosition.x,
    y: finalPosition.y - FINAL_MATCH_LABEL_HEIGHT - FINAL_MATCH_LABEL_GAP,
  };
}

export function getThirdPlacePosition(
  columnCount: number,
): BracketOverlayPosition {
  const finalPosition = getFinalMatchPosition(columnCount);

  return {
    height:
      THIRD_PLACE_LABEL_HEIGHT +
      THIRD_PLACE_SECTION_GAP +
      BRACKET_MATCH_BOX_HEIGHT,
    width: finalPosition.width,
    x: finalPosition.x,
    y: finalPosition.y + finalPosition.matchHeight + FINAL_TO_THIRD_PLACE_GAP,
  };
}

export function getBracketOverlayHeight({
  bracketHeight,
  columnCount,
  hasThirdPlaceMatch,
}: {
  bracketHeight: number;
  columnCount: number;
  hasThirdPlaceMatch: boolean;
}): number {
  const thirdPlacePosition = hasThirdPlaceMatch
    ? getThirdPlacePosition(columnCount)
    : null;

  return Math.max(
    bracketHeight,
    thirdPlacePosition
      ? thirdPlacePosition.y + thirdPlacePosition.height
      : bracketHeight,
  );
}
