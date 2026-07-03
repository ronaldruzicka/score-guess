import type { EnrichedMatch } from "@/features/match-center/build-matches";

import { FileDownloadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Image } from "@unpic/react";
import { useMemo, useState } from "react";

import { Show } from "@/components/show";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMatchStageLabel } from "@/features/match-center/build-matches";
import { MatchStatusBadge } from "@/features/match-center/match-status-badge";
import { POINTS_EXACT, POINTS_OUTCOME } from "@/features/predictions/scoring";
import { cn } from "@/lib/utils";

import {
  formatScoreLine,
  formatTipKickoffDateTime,
  getFinalScoreTone,
  getTipPointsDisplay,
  getTipPointsLabel,
  MY_TIPS_PAGE_SIZE,
} from "./build-my-tips";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, EnrichedMatch>();

const COLUMN_ALIGN: Record<string, string> = {
  finalScore: "text-center",
  kickoff: "text-muted-foreground",
  match: "",
  points: "text-right",
  stage: "text-sm text-muted-foreground",
  status: "",
  yourTip: "text-center",
};

const HEADER_ALIGN: Record<string, string> = {
  finalScore: "text-center",
  points: "text-right",
  yourTip: "text-center",
};

const finalScoreToneClasses = {
  default: "text-primary",
  exact: "text-emerald-500",
  miss: "text-destructive",
  muted: "text-muted-foreground",
} as const;

const pointsToneClasses = {
  exact: "text-emerald-500",
  live: "text-primary",
  missed: "text-destructive",
  outcome: "text-primary",
  pending: "text-muted-foreground",
} as const;

function TeamFlag({ flag }: { readonly flag: string | null }) {
  if (flag) {
    return (
      <Image
        alt=""
        className="h-4 w-6 shrink-0 rounded-xs"
        height={16}
        layout="fixed"
        src={flag}
        width={24}
      />
    );
  }

  return (
    <span className="inline-flex h-4 w-6 shrink-0 items-center justify-center rounded-xs bg-muted text-[0.55rem] text-muted-foreground">
      ?
    </span>
  );
}

function MatchCell({ match }: { readonly match: EnrichedMatch }) {
  const { awayTeam, homeTeam } = match;

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <TeamFlag flag={homeTeam.flag} />
        <span className="text-xs font-bold">{homeTeam.code}</span>
      </div>
      <span className="text-xs text-muted-foreground italic">vs</span>
      <div className="flex flex-col items-center gap-1">
        <TeamFlag flag={awayTeam.flag} />
        <span className="text-xs font-bold">{awayTeam.code}</span>
      </div>
    </div>
  );
}

function getPointsTone(
  match: EnrichedMatch,
  display: ReturnType<typeof getTipPointsDisplay>,
): keyof typeof pointsToneClasses {
  if (!display) {
    return "pending";
  }

  if (match.game.timeElapsed === "live") {
    return "live";
  }

  return display.kind;
}

function formatPointsValue(points: number): string {
  if (points > 0) {
    return `+${points}`;
  }

  return String(points);
}

const columns = columnHelper.columns([
  columnHelper.accessor((row) => row, {
    cell: (info) => <MatchCell match={info.getValue()} />,
    header: "Match",
    id: "match",
  }),
  columnHelper.accessor((row) => row, {
    cell: (info) => formatMatchStageLabel(info.getValue()),
    header: "Stage",
    id: "stage",
  }),
  columnHelper.accessor((row) => row.game.kickoff, {
    cell: (info) => {
      const kickoff = info.getValue();

      return (
        <div className="flex flex-col gap-0.5">
          {formatTipKickoffDateTime(kickoff)}
        </div>
      );
    },
    header: "Date",
    id: "kickoff",
  }),
  columnHelper.accessor((row) => row.game.timeElapsed, {
    cell: (info) => <MatchStatusBadge timeElapsed={info.getValue()} />,
    header: "Status",
    id: "status",
  }),
  columnHelper.accessor((row) => row.prediction, {
    cell: (info) => {
      const prediction = info.getValue();

      if (!prediction) {
        return <span className="text-muted-foreground">—</span>;
      }

      return (
        <span className="font-heading text-lg font-black tracking-widest tabular-nums">
          {formatScoreLine(prediction.homeScore, prediction.awayScore)}
        </span>
      );
    },
    header: "Your tip",
    id: "yourTip",
  }),
  columnHelper.accessor((row) => row, {
    cell: (info) => {
      const match = info.getValue();
      const { game } = match;
      const finalScoreTone = getFinalScoreTone(match);
      const finalScore =
        game.timeElapsed === "upcoming"
          ? "? - ?"
          : formatScoreLine(game.homeScore, game.awayScore);

      return (
        <span
          className={cn(
            "font-heading text-lg font-black tracking-widest tabular-nums",
            finalScoreToneClasses[finalScoreTone],
          )}
        >
          {finalScore}
        </span>
      );
    },
    header: "Final score",
    id: "finalScore",
  }),
  columnHelper.accessor((row) => row, {
    cell: (info) => {
      const match = info.getValue();
      const pointsDisplay = getTipPointsDisplay(match);
      const pointsTone = getPointsTone(match, pointsDisplay);
      const pointsLabel = getTipPointsLabel(match, pointsDisplay);

      return (
        <div className="flex flex-col items-end">
          <span
            className={cn(
              "text-base font-bold tabular-nums",
              pointsToneClasses[pointsTone],
            )}
          >
            {pointsDisplay ? formatPointsValue(pointsDisplay.points) : "--"}
          </span>
          <span
            className={cn(
              "text-[9px] tracking-tight uppercase",
              pointsDisplay?.kind === "missed" &&
                match.game.timeElapsed !== "live"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {pointsLabel}
          </span>
        </div>
      );
    },
    header: "Points",
    id: "points",
  }),
]);

function exportTipsHistory(matches: EnrichedMatch[]) {
  const header = [
    "Match",
    "Stage",
    "Date",
    "Status",
    "Your tip",
    "Final score",
    "Points",
    "Result",
  ];

  const rows = matches.map((match) => {
    const { awayTeam, game, homeTeam, prediction } = match;
    const pointsDisplay = getTipPointsDisplay(match);
    const finalScore =
      game.timeElapsed === "upcoming"
        ? ""
        : formatScoreLine(game.homeScore, game.awayScore);

    return [
      `${homeTeam.code} vs ${awayTeam.code}`,
      formatMatchStageLabel(match),
      formatTipKickoffDateTime(game.kickoff),
      game.timeElapsed,
      prediction
        ? formatScoreLine(prediction.homeScore, prediction.awayScore)
        : "",
      finalScore,
      pointsDisplay ? String(pointsDisplay.points) : "",
      getTipPointsLabel(match, pointsDisplay),
    ];
  });

  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "my-tips-history.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function ScoringLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
      <span className="flex items-center gap-2 before:size-2 before:shrink-0 before:rounded-full before:bg-emerald-500 before:content-['']">
        Exact ({POINTS_EXACT} pts)
      </span>
      <span className="flex items-center gap-2 before:size-2 before:shrink-0 before:rounded-full before:bg-primary before:content-['']">
        Outcome ({POINTS_OUTCOME} pt)
      </span>
      <span className="flex items-center gap-2 before:size-2 before:shrink-0 before:rounded-full before:bg-destructive before:content-['']">
        Miss (0 pts)
      </span>
    </div>
  );
}

export function MyTipsTable({
  matches,
}: {
  readonly matches: EnrichedMatch[];
}) {
  const [visibleCount, setVisibleCount] = useState(MY_TIPS_PAGE_SIZE);
  const visibleMatches = useMemo(
    () => matches.slice(0, visibleCount),
    [matches, visibleCount],
  );
  const hasMore = visibleCount < matches.length;

  const table = useTable(
    { columns, data: visibleMatches, features },
    (state) => state,
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden border-border bg-card py-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border bg-muted/40 hover:bg-muted/40"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-6 py-4 text-xs font-semibold tracking-wider",
                      HEADER_ALIGN[header.column.id],
                      COLUMN_ALIGN[header.column.id],
                    )}
                  >
                    <Show when={!header.isPlaceholder}>
                      <table.FlexRender header={header} />
                    </Show>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                  colSpan={columns.length}
                >
                  No tips submitted yet. Head to Match Center to predict your
                  first score.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("px-6 py-5", COLUMN_ALIGN[cell.column.id])}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {matches.length > 0 ? (
          <div className="flex flex-col items-center gap-4 border-t border-border px-6 py-6">
            <p className="text-sm text-muted-foreground">
              Showing {visibleMatches.length} of {matches.length} predictions
            </p>
            {hasMore ? (
              <Button
                onClick={() => {
                  setVisibleCount((count) => count + MY_TIPS_PAGE_SIZE);
                }}
                type="button"
                variant="outline"
              >
                Load more
              </Button>
            ) : null}
          </div>
        ) : null}
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ScoringLegend />
        <Button
          disabled={matches.length === 0}
          onClick={() => {
            exportTipsHistory(matches);
          }}
          type="button"
        >
          <HugeiconsIcon icon={FileDownloadIcon} strokeWidth={2} />
          Export history
        </Button>
      </div>
    </div>
  );
}
