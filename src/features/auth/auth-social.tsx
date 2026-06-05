import { useState } from "react";

import { Google } from "@/components/icons/google";
import { authClient } from "@/lib/auth-client";
import { formatFieldError } from "@/lib/format-field-error";
import { Route as DashboardRoute } from "@/routes/_protected/dashboard";
import { Button } from "@/ui/button";

type SocialProvider = "apple" | "google";

export function AuthSocial() {
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
    null,
  );

  async function handleSocial(provider: SocialProvider) {
    setError(null);
    setLoadingProvider(provider);

    const result = await authClient.signIn.social({
      callbackURL: DashboardRoute.fullPath,
      errorCallbackURL: "/?auth_error=1",
      provider,
    });

    setLoadingProvider(null);

    if (result.error) {
      setError(
        result.error.message ?? `Could not continue with Google sign in.`,
      );
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {error ? (
        <p
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive"
          role="alert"
        >
          {formatFieldError(error)}
        </p>
      ) : null}
      <Button
        disabled={loadingProvider !== null}
        onClick={() => {
          void handleSocial("google");
        }}
        type="button"
        variant="outline"
        className="w-full"
      >
        <Google />
        {loadingProvider === "google" ? "Connecting…" : "Google"}
      </Button>
    </div>
  );
}
