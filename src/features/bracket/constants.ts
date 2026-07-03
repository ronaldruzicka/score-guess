import type { GameType } from "@/lib/worldcup/schemas";

export type BracketRoundConfig = {
  id: string;
  types: GameType[];
};

export const KNOCKOUT_ROUNDS = [
  {
    id: "r32",
    types: ["r32"],
  },
  {
    id: "r16",
    types: ["r16"],
  },
  {
    id: "qf",
    types: ["qf"],
  },
  {
    id: "sf",
    types: ["sf"],
  },
  {
    id: "finals",
    types: ["third", "final"],
  },
] satisfies readonly BracketRoundConfig[];
