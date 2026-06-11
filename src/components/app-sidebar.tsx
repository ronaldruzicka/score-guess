import * as React from "react";

import { Logo } from "@/assets/logo/logo";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo className="w-10" />
          <h1
            className={
              "text-md truncate font-heading font-black tracking-tight text-foreground"
            }
          >
            FIFA CUP 2026
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
    </Sidebar>
  );
}
