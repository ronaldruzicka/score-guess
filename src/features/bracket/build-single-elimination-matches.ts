import type { EnrichedMatch } from "@/features/match-center/build-matches";

import type { BracketRound } from "./build-bracket";
import type {
  SingleEliminationMatch,
  SingleEliminationParticipant,
} from "./single-elimination-match";

import { formatBracketScore, wentToPenalties } from "./bracket-match-format";
import { buildKnockoutBracket } from "./build-bracket";
import { KNOCKOUT_ROUNDS } from "./constants";

export type SingleEliminationBracketData = {
  matches: SingleEliminationMatch[];
  thirdPlaceMatch: EnrichedMatch | null;
};

const ROUND_NUMBER_BY_ID: Record<string, string> = {
  finals: "5",
  qf: "3",
  r16: "2",
  r32: "1",
  sf: "4",
};

function getWinnerSide(
  match: EnrichedMatch,
  showScore: boolean,
): "away" | "draw" | "home" | null {
  if (!showScore) {
    return null;
  }

  const { game } = match;

  if (wentToPenalties(game)) {
    const homePenalty = game.homePenaltyScore ?? 0;
    const awayPenalty = game.awayPenaltyScore ?? 0;

    if (homePenalty > awayPenalty) {
      return "home";
    }

    if (awayPenalty > homePenalty) {
      return "away";
    }

    return "draw";
  }

  if (game.homeScore > game.awayScore) {
    return "home";
  }

  if (game.awayScore > game.homeScore) {
    return "away";
  }

  return "draw";
}

function getMatchState(match: EnrichedMatch): SingleEliminationMatch["state"] {
  const { awayTeam, game, homeTeam } = match;
  const bothTeamsTbd =
    homeTeam.name === "TBD" &&
    awayTeam.name === "TBD" &&
    game.homeTeamLabel === null &&
    game.awayTeamLabel === null;

  if (bothTeamsTbd && game.timeElapsed === "upcoming") {
    return "NO_PARTY";
  }

  if (game.timeElapsed === "finished") {
    return "SCORE_DONE";
  }

  return "DONE";
}

export function getParticipantId(
  match: EnrichedMatch,
  side: "away" | "home",
): string | number {
  const { awayTeam, game, homeTeam } = match;
  const teamId = side === "home" ? game.homeTeamId : game.awayTeamId;

  if (teamId !== null) {
    return teamId;
  }

  const team = side === "home" ? homeTeam : awayTeam;
  const label = side === "home" ? game.homeTeamLabel : game.awayTeamLabel;

  if (label) {
    return `label:${label}`;
  }

  if (team.name !== "TBD") {
    return `team:${team.code}`;
  }

  return `${game.id}-${side}`;
}

function toParticipant({
  isWinner,
  match,
  side,
}: {
  isWinner: boolean;
  match: EnrichedMatch;
  side: "away" | "home";
}): SingleEliminationParticipant {
  const { awayTeam, game, homeTeam } = match;
  const team = side === "home" ? homeTeam : awayTeam;
  const showScore =
    game.timeElapsed === "finished" || game.timeElapsed === "live";
  const score = side === "home" ? game.homeScore : game.awayScore;
  const penaltyScore =
    side === "home" ? game.homePenaltyScore : game.awayPenaltyScore;

  let status: SingleEliminationParticipant["status"] = null;

  if (team.name === "TBD") {
    status = "NO_PARTY";
  } else if (showScore) {
    status = "PLAYED";
  }

  return {
    id: getParticipantId(match, side),
    isWinner: showScore ? isWinner : false,
    name: team.name,
    resultText: showScore ? formatBracketScore(score, penaltyScore) : null,
    status,
  };
}

function toSingleEliminationMatch({
  match,
  nextMatchId,
  roundId,
}: {
  match: EnrichedMatch;
  nextMatchId: number | string | null;
  roundId: string;
}): SingleEliminationMatch {
  const { game } = match;
  const showScore =
    game.timeElapsed === "finished" || game.timeElapsed === "live";
  const winnerSide = getWinnerSide(match, showScore);

  return {
    id: game.id,
    name: `Match ${game.id}`,
    nextMatchId,
    participants: [
      toParticipant({
        isWinner: winnerSide === "home",
        match,
        side: "home",
      }),
      toParticipant({
        isWinner: winnerSide === "away",
        match,
        side: "away",
      }),
    ],
    startTime: game.kickoff.toISOString(),
    state: getMatchState(match),
    tournamentRoundText: ROUND_NUMBER_BY_ID[roundId] ?? roundId,
  };
}

function getTreeRoundMatches(round: BracketRound): EnrichedMatch[] {
  if (round.id === "finals") {
    return round.matches.filter((match) => match.game.type !== "third");
  }

  return round.matches;
}

function findThirdPlaceMatch(rounds: BracketRound[]): EnrichedMatch | null {
  const finalsRound = rounds.find((round) => round.id === "finals");

  return (
    finalsRound?.matches.find((match) => match.game.type === "third") ?? null
  );
}

function linkSingleEliminationMatches(
  treeRounds: { id: string; matches: EnrichedMatch[] }[],
): SingleEliminationMatch[] {
  const singleEliminationMatches: SingleEliminationMatch[] = [];

  for (let roundIndex = 0; roundIndex < treeRounds.length; roundIndex += 1) {
    const round = treeRounds[roundIndex];
    const nextRound = treeRounds[roundIndex + 1];

    for (
      let matchIndex = 0;
      matchIndex < round.matches.length;
      matchIndex += 1
    ) {
      const match = round.matches[matchIndex];
      const nextMatch =
        nextRound?.matches[Math.floor(matchIndex / 2)] ?? undefined;

      singleEliminationMatches.push(
        toSingleEliminationMatch({
          match,
          nextMatchId: nextMatch?.game.id ?? null,
          roundId: round.id,
        }),
      );
    }
  }

  return singleEliminationMatches;
}

function buildFromRounds(rounds: BracketRound[]): SingleEliminationBracketData {
  const treeRounds = KNOCKOUT_ROUNDS.map((config) => {
    const round = rounds.find((candidate) => candidate.id === config.id);

    return {
      id: config.id,
      matches: round ? getTreeRoundMatches(round) : [],
    };
  }).filter((round) => round.matches.length > 0);

  return {
    matches: linkSingleEliminationMatches(treeRounds),
    thirdPlaceMatch: findThirdPlaceMatch(rounds),
  };
}

export function buildSingleEliminationMatches(
  enrichedMatches: EnrichedMatch[],
): SingleEliminationBracketData {
  return buildFromRounds(buildKnockoutBracket(enrichedMatches));
}

export function countSingleEliminationMatches({
  matches,
  thirdPlaceMatch,
}: SingleEliminationBracketData): number {
  return matches.length + (thirdPlaceMatch ? 1 : 0);
}
