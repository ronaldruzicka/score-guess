import {
  ArrangeByNumbersOneNineIcon,
  ChartIcon,
  DashboardSquare02Icon,
  FootballIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const data = [
  {
    icon: <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />,
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    icon: <HugeiconsIcon icon={FootballIcon} strokeWidth={2} />,
    title: "Match Center",
    url: "/match-center",
  },
  {
    icon: <HugeiconsIcon icon={ArrangeByNumbersOneNineIcon} strokeWidth={2} />,
    title: "Standings",
    url: "/standings",
  },
  {
    icon: <HugeiconsIcon icon={ChartIcon} strokeWidth={2} />,
    title: "Leaderboard",
    url: "/leaderboard",
  },
];

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1">
        {data.map((item) => (
          <SidebarMenuButton
            render={
              <Link
                to={item.url}
                activeProps={{
                  className: "bg-primary text-primary-foreground",
                }}
              >
                {item.icon}
                {item.title}
              </Link>
            }
            key={item.title}
            tooltip={item.title}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
