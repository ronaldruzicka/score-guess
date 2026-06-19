import type { GameType } from "@/lib/worldcup/schemas";

export type StageTab = {
  id: string;
  label: string;
  subtitle: string;
  types: GameType[];
};

export const STAGE_TABS = [
  {
    id: "group",
    label: "Group",
    subtitle: "Group Stage",
    types: ["group"],
  },
  {
    id: "r32",
    label: "R32",
    subtitle: "Round of 32 • Knockout Stage",
    types: ["r32"],
  },
  {
    id: "r16",
    label: "R16",
    subtitle: "Round of 16 • Knockout Stage",
    types: ["r16"],
  },
  {
    id: "qf",
    label: "QF",
    subtitle: "Quarter-finals • Knockout Stage",
    types: ["qf"],
  },
  {
    id: "sf",
    label: "SF",
    subtitle: "Semi-finals • Knockout Stage",
    types: ["sf"],
  },
  {
    id: "finals",
    label: "Final",
    subtitle: "Final • Knockout Stage",
    types: ["third", "final"],
  },
] satisfies readonly StageTab[];
