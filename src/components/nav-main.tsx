import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type Props = Readonly<{
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}>;

export function NavMain({ items }: Props) {
  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1">
        {items.map((item) => (
          <SidebarMenuButton
            className={cn(
              item.isActive && "bg-primary text-primary-foreground",
            )}
            tooltip={item.title}
            key={item.title}
          >
            {item.icon}
            <span>{item.title}</span>
          </SidebarMenuButton>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
