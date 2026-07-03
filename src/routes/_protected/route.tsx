import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { NavUser } from "@/components/nav-user";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router redirects are thrown intentionally
      throw redirect({ to: "/" });
    }

    return { user: session.user };
  },
  component: PathlessLayoutComponent,
});

function PathlessLayoutComponent() {
  const { user } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <AppSidebar
        className="group-data-[side=left]:border-r-0"
        variant="inset"
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Suspense fallback={<div>Loading...</div>}>
            <NavUser user={user} />
          </Suspense>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
