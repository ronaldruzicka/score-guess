import { createFileRoute } from "@tanstack/react-router";

import { Auth } from "@/features/auth/auth";
import BetterAuthHeader from "@/integrations/better-auth/header-user";
import { authClient } from "@/lib/auth-client";

function Home() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div
          aria-busy="true"
          aria-label="Loading"
          className="h-10 w-10 animate-pulse rounded-lg border border-border"
        />
      </main>
    );
  }

  if (!session?.user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            FIFA Cup 2026
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {session.user.name ?? session.user.email}
          </p>
        </div>
        <BetterAuthHeader />
      </header>
      <p className="text-muted-foreground">
        Score predictions and match tracking will appear here.
      </p>
    </div>
  );
}

export const Route = createFileRoute("/")({ component: Home });
