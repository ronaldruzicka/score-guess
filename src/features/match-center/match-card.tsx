import type { EnrichedMatch } from "./build-matches";

import { Card, CardContent } from "@/components/ui/card";

import { PredictionForm } from "./prediction-form";

export function MatchCard({ match }: { readonly match: EnrichedMatch }) {
  return (
    <Card className="border-border/80 bg-card/80 py-0 backdrop-blur-sm">
      <CardContent className="p-6">
        <PredictionForm match={match} />
      </CardContent>
    </Card>
  );
}
