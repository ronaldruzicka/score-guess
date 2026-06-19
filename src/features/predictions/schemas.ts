import { z } from "zod";

// Generous upper bound; real scores never approach this, it just guards input.
const MAX_GOALS = 99;

const boundedScoreSchema = z.number().int().min(0).max(MAX_GOALS);

const scoreSchema = z.coerce.number().pipe(boundedScoreSchema);

const scoreFieldSchema = z
  .string()
  .min(1, { message: "Enter a score between 0 and 99." })
  .transform(Number)
  .pipe(boundedScoreSchema);

export const predictionFormSchema = z.object({
  awayScore: scoreFieldSchema,
  homeScore: scoreFieldSchema,
});

export const predictionInputSchema = z.object({
  awayScore: scoreSchema,
  homeScore: scoreSchema,
  matchId: z.coerce.number().int().positive(),
});

export type PredictionFormInput = z.input<typeof predictionFormSchema>;
export type PredictionFormValues = z.output<typeof predictionFormSchema>;
export type PredictionInput = z.infer<typeof predictionInputSchema>;
