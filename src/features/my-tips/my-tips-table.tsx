import type { EnrichedMatch } from "@/features/match-center/build-matches";

import { FileDownloadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

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
import { POINTS_EXACT, POINTS_OUTCOME } from "@/features/predictions/scoring";

import {
  formatScoreLine,
  formatTipKickoffDate,
  getTipPointsDisplay,
  MY_TIPS_PAGE_SIZE,
} from "./build-my-tips";
import { MyTipsTableRow } from "./my-tips-table-row";

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
      formatTipKickoffDate(game.kickoff),
      game.timeElapsed,
      prediction
        ? formatScoreLine(prediction.homeScore, prediction.awayScore)
        : "",
      finalScore,
      pointsDisplay.kind === "pending" ? "" : String(pointsDisplay.points),
      pointsDisplay.label,
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
  const visibleMatches = matches.slice(0, visibleCount);
  const hasMore = visibleCount < matches.length;

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden border-border bg-card py-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider">
                Match
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider">
                Stage
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider">
                Date
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-center text-xs font-semibold tracking-wider">
                Your tip
              </TableHead>
              <TableHead className="px-6 py-4 text-center text-xs font-semibold tracking-wider">
                Final score
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-xs font-semibold tracking-wider">
                Points
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleMatches.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                  colSpan={7}
                >
                  No tips submitted yet. Head to Match Center to predict your
                  first score.
                </TableCell>
              </TableRow>
            ) : (
              visibleMatches.map((match) => (
                <MyTipsTableRow key={match.game.id} match={match} />
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
