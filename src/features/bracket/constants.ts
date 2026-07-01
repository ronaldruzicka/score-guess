import type { GameType } from "@/lib/worldcup/schemas";

export type BracketRoundConfig = {
  id: string;
  label: string;
  subtitle: string;
  types: GameType[];
};

export const KNOCKOUT_ROUNDS = [
  {
    id: "r32",
    label: "Round of 32",
    subtitle: "32 teams",
    types: ["r32"],
  },
  {
    id: "r16",
    label: "Round of 16",
    subtitle: "16 teams",
    types: ["r16"],
  },
  {
    id: "qf",
    label: "Quarter-finals",
    subtitle: "8 teams",
    types: ["qf"],
  },
  {
    id: "sf",
    label: "Semi-finals",
    subtitle: "4 teams",
    types: ["sf"],
  },
  {
    id: "finals",
    label: "Finals",
    subtitle: "Third place & Final",
    types: ["third", "final"],
  },
] satisfies readonly BracketRoundConfig[];
