import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div>
      Hello "/(protected)/dashboard/"!{" "}
      <Button
        onClick={async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                navigate({ to: "/" });
              },
            },
          });
        }}
      >
        Logout
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/_protected/dashboard/")({
  component: RouteComponent,
});
