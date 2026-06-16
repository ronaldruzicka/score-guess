import { z } from "zod";

// Generous upper bound; real scores never approach this, it just guards input.
const MAX_GOALS = 99;

const scoreSchema = z.coerce.number().int().min(0).max(MAX_GOALS);

export const predictionInputSchema = z.object({
  awayScore: scoreSchema,
  homeScore: scoreSchema,
  matchId: z.coerce.number().int().positive(),
});

export type PredictionInput = z.infer<typeof predictionInputSchema>;
