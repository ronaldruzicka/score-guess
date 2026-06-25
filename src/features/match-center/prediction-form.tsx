import type { AnyFieldApi } from "@tanstack/react-form";

import type { PredictionFormInput } from "@/features/predictions/schemas";

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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { useState } from "react";

import { Show } from "@/components/show";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertPrediction } from "@/features/predictions/functions";
import { predictionFormSchema } from "@/features/predictions/schemas";
import { formatFieldError } from "@/lib/format-field-error";
import { cn } from "@/lib/utils";

import {
  formatCountdown,
  formatKickoffTime,
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

function TeamFlag({ flag }: { readonly flag: MatchTeam["flag"] }) {
  return (
    <Show
      when={flag}
      fallback={
        <span className="inline-flex items-center justify-center text-muted-foreground">
          <HugeiconsIcon
            className="size-5 @xs/prediction-form:size-6"
            icon={Flag02Icon}
          />
        </span>
      }
    >
      {(flagSrc) => (
        <Image
          alt=""
          className="size-8 rounded-xs @xs/prediction-form:size-10"
          height={40}
          layout="fixed"
          src={flagSrc}
          width={40}
        />
      )}
    </Show>
  );
}

function TeamBlock({
  align,
  team,
}: {
  readonly align: "left" | "right";
  readonly team: MatchTeam;
}) {
  const isRight = align === "right";

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
          <TeamBlock align="left" team={homeTeam} />

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

          <TeamBlock align="right" team={awayTeam} />
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
