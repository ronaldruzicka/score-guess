import type { StandingRow } from "./build-standings";

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Image } from "@unpic/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, StandingRow>();

// Numeric stat columns are centered; the team column stays left-aligned.
const COLUMN_ALIGN: Record<string, string> = {
  drawn: "text-center tabular-nums",
  goalDifference: "text-center tabular-nums",
  lost: "text-center tabular-nums",
  played: "text-center tabular-nums",
  points: "text-center font-medium tabular-nums",
  position: "text-center tabular-nums",
  teamName: "max-w-0 w-full",
  won: "text-center tabular-nums",
};

function GoalDiffCell({ value }: { readonly value: number }) {
  return (
    <span
      className={cn(
        COLUMN_ALIGN.goalDifference,
        value > 0 ? "text-green-500" : "text-red-500",
      )}
    >
      {value > 0 ? `+${value}` : String(value)}
    </span>
  );
}

const columns = columnHelper.columns([
  columnHelper.accessor("position", {
    cell: (info) => (
      <span
        className={cn(
          info.row.index <= 1 ? "text-primary" : "text-muted-foreground",
        )}
      >
        {info.getValue()}
      </span>
    ),
    header: "#",
  }),
  columnHelper.accessor("teamName", {
    cell: (info) => {
      const { flag, teamName } = info.row.original;

      return (
        <div className="flex min-w-0 items-center gap-2">
          {flag ? (
            <Image
              src={flag}
              alt=""
              layout="fixed"
              width={20}
              height={14}
              className="shrink-0 rounded-xs"
            />
          ) : null}
          <span className="min-w-0 truncate">{teamName}</span>
        </div>
      );
    },
    header: "Team",
  }),
  columnHelper.accessor("played", { header: "MP" }),
  columnHelper.accessor("won", { header: "W" }),
  columnHelper.accessor("drawn", { header: "D" }),
  columnHelper.accessor("lost", { header: "L" }),
  columnHelper.accessor("goalDifference", {
    cell: (info) => <GoalDiffCell value={info.getValue()} />,
    header: "GD",
  }),
  columnHelper.accessor("points", { header: "Pts" }),
]);

export function StandingsTable({ rows }: { readonly rows: StandingRow[] }) {
  const table = useTable({ columns, data: rows, features }, (state) => state);

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={COLUMN_ALIGN[header.column.id]}
              >
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id} className={COLUMN_ALIGN[cell.column.id]}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
