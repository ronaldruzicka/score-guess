import type { Group, GroupStanding, Team } from "@/lib/worldcup/schemas";

export type StandingRow = GroupStanding & {
  flag: string | null;
  position: number;
  teamName: string;
};

export type GroupStandings = {
  name: string;
  rows: StandingRow[];
};

/**
 * The API returns group standings in team-id order, so we sort here using the
 * standard tiebreakers we can derive from the payload: points, then goal
 * difference, then goals scored, then name. (Head-to-head, the official next
 * tiebreaker, isn't available from this endpoint.)
 */
export function buildGroupStandings(
  groups: Group[],
  teams: Team[],
): GroupStandings[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));

  return groups
    .map((group) => {
      const rows = group.standings
        .map((standing) => {
          const team = teamById.get(standing.teamId);

          return {
            drawn: standing.drawn,
            flag: team?.flag ?? null,
            goalDifference: standing.goalDifference,
            goalsAgainst: standing.goalsAgainst,
            goalsFor: standing.goalsFor,
            lost: standing.lost,
            played: standing.played,
            points: standing.points,
            teamId: standing.teamId,
            teamName: team?.name ?? `Team ${standing.teamId}`,
            won: standing.won,
          };
        })
        .toSorted(
          (a, b) =>
            b.points - a.points ||
            b.goalDifference - a.goalDifference ||
            b.goalsFor - a.goalsFor ||
            a.teamName.localeCompare(b.teamName),
        )
        .map((row, index) => ({ ...row, position: index + 1 }));

      return { name: group.name, rows };
    })
    .toSorted((a, b) => a.name.localeCompare(b.name));
}
