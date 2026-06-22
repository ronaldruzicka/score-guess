import type { LeaderboardRow } from "@/features/predictions/functions";

import { UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import { Show } from "@/components/show";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitials } from "@/lib/get-initials";
import { cn } from "@/lib/utils";

import {
  formatAccuracy,
  formatLeaderboardPoints,
  formatLeaderboardRank,
} from "./leaderboard-utils";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, LeaderboardRow>();

const COLUMN_ALIGN: Record<string, string> = {
  accuracy: "text-left tabular-nums",
  form: "text-center",
  name: "max-w-0 w-full",
  points: "text-left font-mono tabular-nums",
  rank: "text-left font-bold tabular-nums",
};

function FormDots({ form }: { readonly form: LeaderboardRow["recentForm"] }) {
  if (form.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {form.map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={cn(
            "size-2 rounded-full",
            result === "win" ? "bg-emerald-400" : "bg-destructive",
          )}
        />
      ))}
    </div>
  );
}

function NameCell({
  image,
  isCurrentUser,
  name,
}: {
  readonly image: string | null;
  readonly isCurrentUser: boolean;
  readonly name: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        size="sm"
        className={cn(
          isCurrentUser && "ring-2 ring-primary ring-offset-2 ring-offset-card",
        )}
      >
        {image ? <AvatarImage alt="" src={image} /> : null}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="flex items-center gap-1 truncate font-medium">
          {name}
          <Show when={isCurrentUser} fallback={null}>
            <HugeiconsIcon
              icon={UserCircleIcon}
              className="text-emerald-400"
              size={20}
            />
          </Show>
        </p>
      </div>
    </div>
  );
}

function createColumns(currentUserId: string) {
  return columnHelper.columns([
    columnHelper.accessor("rank", {
      cell: (info) => (
        <span className="text-base font-bold">
          {formatLeaderboardRank(info.getValue())}
        </span>
      ),
      header: "Rank",
    }),
    columnHelper.accessor("name", {
      cell: (info) => {
        const { image, name, userId } = info.row.original;

        return (
          <NameCell
            image={image}
            isCurrentUser={userId === currentUserId}
            name={name}
          />
        );
      },
      header: "User",
    }),
    columnHelper.accessor("points", {
      cell: (info) => formatLeaderboardPoints(info.getValue()),
      header: "Points",
    }),
    columnHelper.accessor((row) => row, {
      cell: (info) => formatAccuracy(info.getValue()),
      header: "Accuracy",
      id: "accuracy",
    }),
    columnHelper.accessor("recentForm", {
      cell: (info) => <FormDots form={info.getValue()} />,
      header: "Form",
    }),
  ]);
}

export function LeaderboardTable({
  currentUserId,
  rows,
}: {
  readonly currentUserId: string;
  readonly rows: LeaderboardRow[];
}) {
  const columns = createColumns(currentUserId);
  const table = useTable({ columns, data: rows, features }, (state) => state);

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className="border-border bg-muted/30 hover:bg-muted/30"
          >
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  "px-6 py-4 text-[10px] font-black tracking-wider",
                  COLUMN_ALIGN[header.column.id],
                )}
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
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell
              className="py-10 text-center text-muted-foreground"
              colSpan={columns.length}
            >
              No additional players yet. Everyone is on the podium.
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => {
            const isCurrentUser = row.original.userId === currentUserId;

            return (
              <TableRow
                key={row.id}
                className={cn(
                  "border-border",
                  isCurrentUser &&
                    "bg-primary/20 hover:bg-primary/10 data-[state=selected]:bg-primary/10",
                )}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn("px-6 py-5", COLUMN_ALIGN[cell.column.id])}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
