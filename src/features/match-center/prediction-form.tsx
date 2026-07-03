import type { AnyFieldApi } from "@tanstack/react-form";

import type { PredictionFormInput } from "@/features/predictions/schemas";
import type { Group, Team } from "@/lib/worldcup/schemas";

import type { EnrichedMatch, MatchTeam } from "./build-matches";

import {
  Cancel01Icon,
  Edit02Icon,
  Flag02Icon,
  SaveIcon,
  UnavailableIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { useMemo, useState } from "react";

import { MatchResultBadge } from "@/components/match-result-badge";
import { Show } from "@/components/show";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { upsertPrediction } from "@/features/predictions/functions";
import { predictionFormSchema } from "@/features/predictions/schemas";
import { formatFieldError } from "@/lib/format-field-error";
import { cn } from "@/lib/utils";
import {
  groupsQueryOptions,
  gamesQueryOptions,
  teamsQueryOptions,
} from "@/lib/worldcup/queries";

import {
  buildEnrichedMatches,
  findTeamByMatchTeam,
  findTeamGroupRank,
  formatCountdown,
  formatKickoffTime,
  getTeamFinishedMatches,
  getTeamMatchResult,
  isTippingOpen,
  shouldShowKickoffCountdown,
} from "./build-matches";
import { MatchStatusBadge } from "./match-status-badge";
import { myPredictionsQueryOptions } from "./queries";

function ScoreField({
  ariaLabel,
  field,
}: {
  readonly ariaLabel: string;
  readonly field: Pick<
    AnyFieldApi,
    "handleBlur" | "handleChange" | "name" | "state"
  >;
}) {
  const hasError =
    !field.state.meta.isValid &&
    (field.state.meta.isBlurred || field.state.meta.isTouched);

  return (
    <Input
      aria-invalid={hasError || undefined}
      aria-label={ariaLabel}
      className={cn(
        "size-12 appearance-none rounded-lg border-2 p-0 text-center text-xl! leading-none font-bold tabular-nums [-moz-appearance:textfield] @xs/prediction-form:size-14 @xs/prediction-form:text-2xl! [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        hasError && "border-destructive",
      )}
      inputMode="numeric"
      max={99}
      min={0}
      name={field.name}
      onBlur={field.handleBlur}
      onChange={(event) => field.handleChange(event.target.value)}
      type="number"
      value={field.state.value}
    />
  );
}

function ScoreTip({ tip }: { readonly tip: number | undefined }) {
  return (
    <div className="flex size-12 items-center justify-center rounded-lg bg-input/30 text-xl font-bold text-muted-foreground @xs/prediction-form:size-14 @xs/prediction-form:text-2xl">
      {tip ?? <HugeiconsIcon icon={UnavailableIcon} size={20} />}
    </div>
  );
}

function TeamFlag({
  flag,
  className,
}: {
  readonly flag: MatchTeam["flag"];
  readonly className?: string;
}) {
  return (
    <Show
      when={flag}
      fallback={
        <span
          className={cn(
            "inline-flex items-center justify-center text-muted-foreground",
            className,
          )}
        >
          <HugeiconsIcon
            className="@xs/prediction-form:width-6 width-5"
            icon={Flag02Icon}
          />
        </span>
      }
    >
      {(flagSrc) => (
        <Image
          alt=""
          className={cn(
            "@xs/prediction-form:width-10 width-8 rounded-xs",
            className,
          )}
          aspectRatio={3 / 2}
          layout="fixed"
          src={flagSrc}
          width={40}
        />
      )}
    </Show>
  );
}

function formatGroupPosition(position: number): string {
  const remainder = position % 100;

  if (remainder >= 11 && remainder <= 13) {
    return `${position}th`;
  }

  switch (position % 10) {
    case 1: {
      return `${position}st`;
    }
    case 2: {
      return `${position}nd`;
    }
    case 3: {
      return `${position}rd`;
    }
    default: {
      return `${position}th`;
    }
  }
}

function TeamInfoPopoverContent({
  groupRank,
  recentMatches,
  team,
  teamId,
}: {
  readonly groupRank: { groupName: string; position: number } | null;
  readonly recentMatches: EnrichedMatch[];
  readonly team: MatchTeam;
  readonly teamId: number;
}) {
  return (
    <>
      <PopoverHeader>
        <PopoverTitle>{team.name}</PopoverTitle>
        <Show
          when={groupRank}
          fallback={
            <PopoverDescription>Group standings unavailable</PopoverDescription>
          }
        >
          {(rank) => (
            <PopoverDescription>
              Group {rank.groupName} · {formatGroupPosition(rank.position)}
            </PopoverDescription>
          )}
        </Show>
      </PopoverHeader>

      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Recent matches
        </p>
        <Show
          when={recentMatches.length > 0}
          fallback={
            <p className="text-xs text-muted-foreground">No recent matches</p>
          }
        >
          <ul className="flex flex-col gap-1">
            {recentMatches.map((recentMatch) => {
              const result = getTeamMatchResult(recentMatch, teamId);

              return (
                <li
                  key={recentMatch.game.id}
                  className="grid grid-cols-6 grid-rows-1 items-center justify-between gap-1 text-xs"
                >
                  <span className="col-span-3 inline-flex items-center gap-1 truncate text-foreground">
                    <TeamFlag flag={result.opponentFlag} className="size-4" />
                    {result.opponentName}
                  </span>
                  <span className="col-span-2 text-center font-bold tabular-nums">
                    {result.teamScore}-{result.opponentScore}
                  </span>
                  <span className="col-span-1 text-right">
                    <MatchResultBadge result={result.result} />
                  </span>
                </li>
              );
            })}
          </ul>
        </Show>
      </div>
    </>
  );
}

function TeamBlock({
  align,
  allMatches,
  currentMatchId,
  groups,
  team,
  teams,
}: {
  readonly align: "left" | "right";
  readonly allMatches: EnrichedMatch[];
  readonly currentMatchId: number;
  readonly groups: Group[];
  readonly team: MatchTeam;
  readonly teams: Team[];
}) {
  const isRight = align === "right";
  const resolvedTeam = findTeamByMatchTeam(team, teams);

  const groupRank =
    resolvedTeam === undefined
      ? null
      : findTeamGroupRank(resolvedTeam.id, groups, teams);

  const recentMatches =
    resolvedTeam === undefined
      ? []
      : getTeamFinishedMatches(allMatches, resolvedTeam.id, {
          excludeMatchId: currentMatchId,
        });

  const teamContent = (
    <>
      <div
        className={cn(
          "shrink-0",
          "@xs/prediction-form:flex @xs/prediction-form:size-16 @xs/prediction-form:items-center @xs/prediction-form:justify-center @xs/prediction-form:rounded-full @xs/prediction-form:bg-muted/60 @xs/prediction-form:p-px",
          isRight
            ? "@xs/prediction-form:self-start"
            : "@xs/prediction-form:self-end",
        )}
      >
        <TeamFlag flag={team.flag} />
      </div>
      <h3
        className={cn(
          "min-w-0 flex-1 truncate text-left font-heading text-sm font-bold",
          "@xs/prediction-form:w-full @xs/prediction-form:flex-none @xs/prediction-form:text-xl",
          isRight
            ? "@xs/prediction-form:text-left"
            : "@xs/prediction-form:text-right",
        )}
      >
        {team.name}
      </h3>
    </>
  );

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        isRight ? "col-start-1 row-start-3" : "col-start-1 row-start-2",
        "@xs/prediction-form:col-auto @xs/prediction-form:row-auto",
        "@xs/prediction-form:min-w-0 @xs/prediction-form:flex-1",
        "@xs/prediction-form:flex-col @xs/prediction-form:gap-3",
        "@xs/prediction-form:items-stretch",
        isRight
          ? "@xs/prediction-form:text-left"
          : "@xs/prediction-form:text-right",
      )}
    >
      <Show when={resolvedTeam}>
        {(teamRecord) => (
          <Popover>
            <PopoverTrigger
              closeDelay={150}
              delay={200}
              nativeButton={false}
              openOnHover
              render={
                <div
                  className={cn(
                    "flex min-w-0 cursor-default items-center gap-3",
                    "@xs/prediction-form:flex-col @xs/prediction-form:gap-3",
                    "@xs/prediction-form:items-stretch",
                  )}
                />
              }
            >
              {teamContent}
            </PopoverTrigger>
            <PopoverContent
              align={isRight ? "start" : "end"}
              className="w-64"
              side="top"
            >
              <TeamInfoPopoverContent
                groupRank={groupRank}
                recentMatches={recentMatches}
                team={team}
                teamId={teamRecord.id}
              />
            </PopoverContent>
          </Popover>
        )}
      </Show>
      <Show when={!resolvedTeam}>{teamContent}</Show>
    </div>
  );
}

function KickoffTime({
  className,
  kickoff,
}: {
  readonly className?: string;
  readonly kickoff: Date;
}) {
  return (
    <p className={cn("text-xs font-medium text-muted-foreground", className)}>
      {formatKickoffTime(kickoff)}
    </p>
  );
}

function MatchStatusHeader({
  className,
  kickoff,
  timeElapsed,
}: {
  readonly className?: string;
  readonly kickoff: Date;
  readonly timeElapsed: EnrichedMatch["game"]["timeElapsed"];
}) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <MatchStatusBadge timeElapsed={timeElapsed} />
      <Show when={shouldShowKickoffCountdown(kickoff)}>
        <p className="text-[10px] font-medium text-muted-foreground">
          {formatCountdown(kickoff)}
        </p>
      </Show>
    </div>
  );
}

export function PredictionForm({ match }: { readonly match: EnrichedMatch }) {
  const tippingOpen = isTippingOpen(match);
  const { awayTeam, game, homeTeam, prediction } = match;
  const hasPrediction = prediction !== null;
  const [isEditing, setIsEditing] = useState(false);
  const isFormEditable = tippingOpen && (!hasPrediction || isEditing);
  const queryClient = useQueryClient();
  const { data: games } = useSuspenseQuery(gamesQueryOptions);
  const { data: teams } = useSuspenseQuery(teamsQueryOptions);
  const { data: groups } = useSuspenseQuery(groupsQueryOptions);
  const { data: predictions } = useSuspenseQuery(myPredictionsQueryOptions);

  const allMatches = useMemo(
    () =>
      buildEnrichedMatches({
        games,
        predictions,
        teams,
      }),
    [games, predictions, teams],
  );

  const mutation = useMutation({
    mutationFn: (value: { awayScore: number; homeScore: number }) =>
      upsertPrediction({
        data: {
          awayScore: value.awayScore,
          homeScore: value.homeScore,
          matchId: game.id,
        },
      }),
    onSuccess: async () => {
      setIsEditing(false);
      await queryClient.invalidateQueries({
        queryKey: myPredictionsQueryOptions.queryKey,
      });
    },
  });

  const form = useForm({
    defaultValues: {
      awayScore: prediction === null ? "" : String(prediction.awayScore),
      homeScore: prediction === null ? "" : String(prediction.homeScore),
    } satisfies PredictionFormInput,
    validators: {
      onChange: predictionFormSchema,
      onSubmit: predictionFormSchema,
      onSubmitAsync: async ({ value }) => {
        const parsed = predictionFormSchema.safeParse(value);

        if (!parsed.success) {
          return { form: "Enter a score between 0 and 99 for both teams." };
        }

        try {
          await mutation.mutateAsync(parsed.data);
        } catch (mutationError) {
          return {
            form:
              mutationError instanceof Error
                ? mutationError.message
                : "Could not save prediction.",
          };
        }

        return null;
      },
    },
  });

  return (
    <form
      className="@container/prediction-form flex flex-col gap-8"
      onSubmit={async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isFormEditable) {
          return;
        }

        await form.handleSubmit();
      }}
    >
      <div
        className={cn(
          "grid gap-2",
          "grid-cols-[minmax(0,1fr)_auto]",
          "@xs/prediction-form:grid-cols-1",
          "@xs/prediction-form:gap-y-4",
        )}
      >
        <div
          className={cn(
            "contents",
            "@xs/prediction-form:col-span-1 @xs/prediction-form:row-start-1",
            "@xs/prediction-form:flex @xs/prediction-form:items-center",
            "@xs/prediction-form:justify-between @xs/prediction-form:gap-4",
          )}
        >
          <TeamBlock
            align="left"
            allMatches={allMatches}
            currentMatchId={game.id}
            groups={groups}
            team={homeTeam}
            teams={teams}
          />

          <div
            className={cn(
              "contents",
              "@xs/prediction-form:flex @xs/prediction-form:flex-1",
              "@xs/prediction-form:flex-col @xs/prediction-form:items-center",
              "@xs/prediction-form:border-x @xs/prediction-form:border-border/30",
              "@xs/prediction-form:shrink-0 @xs/prediction-form:px-4",
            )}
          >
            <MatchStatusHeader
              className={cn(
                "col-span-2 col-start-1 row-start-1 justify-self-center",
                "@xs/prediction-form:col-auto @xs/prediction-form:row-auto",
              )}
              kickoff={game.kickoff}
              timeElapsed={game.timeElapsed}
            />

            <div
              className={cn(
                "contents",
                "@xs/prediction-form:flex @xs/prediction-form:items-center",
                "@xs/prediction-form:gap-3 @xs/prediction-form:pt-4",
              )}
            >
              <div
                className={cn(
                  "col-start-2 row-start-2",
                  "@xs/prediction-form:col-auto @xs/prediction-form:row-auto",
                )}
              >
                <Show
                  when={isFormEditable}
                  fallback={<ScoreTip tip={prediction?.homeScore} />}
                >
                  <form.Field name="homeScore">
                    {(field) => (
                      <ScoreField
                        ariaLabel="Home score prediction"
                        field={field}
                      />
                    )}
                  </form.Field>
                </Show>
              </div>

              <span
                className={cn(
                  "hidden h-0.5 w-2 shrink-0 rounded-full bg-border",
                  "@xs/prediction-form:inline",
                )}
              />

              <div
                className={cn(
                  "col-start-2 row-start-3",
                  "@xs/prediction-form:col-auto @xs/prediction-form:row-auto",
                )}
              >
                <Show
                  when={isFormEditable}
                  fallback={<ScoreTip tip={prediction?.awayScore} />}
                >
                  <form.Field name="awayScore">
                    {(field) => (
                      <ScoreField
                        ariaLabel="Away score prediction"
                        field={field}
                      />
                    )}
                  </form.Field>
                </Show>
              </div>
            </div>

            <KickoffTime
              className={cn(
                "col-span-2 col-start-1 row-start-4 justify-self-center pt-1",
                "@xs/prediction-form:col-auto @xs/prediction-form:row-auto",
                "@xs/prediction-form:pt-4",
              )}
              kickoff={game.kickoff}
            />
          </div>

          <TeamBlock
            align="right"
            allMatches={allMatches}
            currentMatchId={game.id}
            groups={groups}
            team={awayTeam}
            teams={teams}
          />
        </div>
      </div>

      <Show when={isFormEditable}>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button disabled={!canSubmit || isSubmitting} type="submit">
                  <HugeiconsIcon icon={SaveIcon} />
                  {isSubmitting ? "Saving…" : "Submit Tip"}
                </Button>
              )}
            </form.Subscribe>
            <Show when={hasPrediction && isEditing}>
              <Button
                disabled={mutation.isPending}
                onClick={() => {
                  if (prediction === null) {
                    return;
                  }

                  form.reset({
                    awayScore: String(prediction.awayScore),
                    homeScore: String(prediction.homeScore),
                  });
                  setIsEditing(false);
                }}
                type="button"
                variant="outline"
                size="icon"
              >
                <HugeiconsIcon icon={Cancel01Icon} />
              </Button>
            </Show>
          </div>
          <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
            {(formError) => {
              const message = formError ? formatFieldError(formError) : null;

              return message ? (
                <p className="text-xs text-destructive" role="alert">
                  {message}
                </p>
              ) : null;
            }}
          </form.Subscribe>
        </div>
      </Show>
      <Show when={tippingOpen && hasPrediction && !isEditing}>
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setIsEditing(true);
            }}
            type="button"
            variant="outline"
          >
            <HugeiconsIcon icon={Edit02Icon} />
            Edit tip
          </Button>
        </div>
      </Show>
      <Show when={!tippingOpen}>
        <p className="text-center text-sm text-muted-foreground">
          Tipping is no longer possible for this match.
        </p>
      </Show>
    </form>
  );
}
