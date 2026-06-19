export const POINTS_EXACT = 3;
export const POINTS_OUTCOME = 1;

type ScoreLike = {
  awayScore: number;
  homeScore: number;
};

type Outcome = -1 | 0 | 1;

function outcome({ awayScore, homeScore }: ScoreLike): Outcome {
  if (homeScore > awayScore) {
    return 1;
  }

  if (homeScore < awayScore) {
    return -1;
  }

  return 0;
}

export function isExactHit(prediction: ScoreLike, result: ScoreLike): boolean {
  return (
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore
  );
}

/**
 * Exact score = 3 pts, correct outcome (win/draw/loss) = 1 pt, otherwise 0.
 */
export function getTipResultLabel(points: number): string | null {
  if (points === POINTS_EXACT) {
    return "Perfect Score";
  }

  if (points === POINTS_OUTCOME) {
    return "Result Correct";
  }

  return null;
}

export function scorePrediction(
  prediction: ScoreLike,
  result: ScoreLike,
): number {
  if (isExactHit(prediction, result)) {
    return POINTS_EXACT;
  }

  if (outcome(prediction) === outcome(result)) {
    return POINTS_OUTCOME;
  }

  return 0;
}
