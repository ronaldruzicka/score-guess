import { createFileRoute, redirect } from "@tanstack/react-router";

import { Auth } from "@/features/auth/auth";
import { getSession } from "@/lib/auth.functions";

function Home() {
  return <Auth />;
}

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();

    if (session) {
      // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router redirects are thrown intentionally
      throw redirect({ to: "/dashboard" });
    }
  },
  component: Home,
});
