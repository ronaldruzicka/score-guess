import type { Game } from "@/lib/worldcup/schemas";

const bracketKickoffFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
  month: "short",
});

export function formatBracketKickoff(kickoff: Date): string {
  const parts = bracketKickoffFormatter.formatToParts(kickoff);

  const month =
    parts.find((part) => part.type === "month")?.value.toUpperCase() ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";
  const dayPeriod =
    parts.find((part) => part.type === "dayPeriod")?.value.toUpperCase() ?? "";

  return `${month} ${day} - ${hour}:${minute} ${dayPeriod}`;
}

export function wentToPenalties(game: Game): boolean {
  return game.homePenaltyScore !== null && game.awayPenaltyScore !== null;
}

const bracketKickoffTooltipFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

export function getBracketStatusLabel(game: Game): string {
  if (game.timeElapsed === "live") {
    return "LIVE";
  }

  if (game.timeElapsed === "finished") {
    return wentToPenalties(game) ? "FT-PENS" : "FT";
  }

  return formatBracketKickoff(game.kickoff);
}

export function getBracketStatusTooltip(game: Game): string {
  if (game.timeElapsed === "live") {
    return "Match is currently in progress";
  }

  if (game.timeElapsed === "finished") {
    return wentToPenalties(game)
      ? "Full time — decided by penalty shootout after extra time"
      : "Full time — match finished after 90 minutes";
  }

  return `Scheduled kickoff — ${bracketKickoffTooltipFormatter.format(game.kickoff)}`;
}

export function formatBracketScore(
  score: number,
  penaltyScore: number | null,
): string {
  if (penaltyScore !== null) {
    return `${score} (${penaltyScore})`;
  }

  return String(score);
}
