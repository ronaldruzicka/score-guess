"use client";

import {
  ArrangeByNumbersOneNineIcon,
  ChartIcon,
  DashboardSquare02Icon,
  FootballIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";

import { Logo } from "@/assets/logo/logo";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      icon: <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />,
      isActive: true,
      title: "Dashboard",
      url: "#",
    },
    {
      icon: <HugeiconsIcon icon={FootballIcon} strokeWidth={2} />,
      title: "Match Center",
      url: "#",
    },
    {
      icon: (
        <HugeiconsIcon icon={ArrangeByNumbersOneNineIcon} strokeWidth={2} />
      ),
      title: "Standings",
      url: "#",
    },
    {
      icon: <HugeiconsIcon icon={ChartIcon} strokeWidth={2} />,
      title: "Leaderboard",
      url: "#",
    },
  ],
  user: {
    avatar: "/avatars/shadcn.jpg",
    email: "m@example.com",
    name: "shadcn",
  },
};

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
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
