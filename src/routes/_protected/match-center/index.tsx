import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

function RouteComponent() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Hello from {location.pathname}!</h1>
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

export const Route = createFileRoute("/_protected/match-center/")({
  component: RouteComponent,
});
