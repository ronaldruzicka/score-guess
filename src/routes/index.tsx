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
      throw redirect({ to: "/dashboard" });
    }
  },
  component: Home,
});
