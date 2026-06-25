"use client";

import {
  AudioLinesIcon,
  Building2Icon,
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  TerminalIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { NavUser } from "@/components/nav-user";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  organizations: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon aria-hidden="true" />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon aria-hidden="true" />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon aria-hidden="true" />,
      plan: "Free",
    },
  ],
  main: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon aria-hidden="true" />,
    },
  ],
  platform: [
    {
      title: "Users",
      url: "/admin/users",
      icon: <UsersIcon aria-hidden="true" />,
    },
    {
      title: "Organization",
      url: "/admin/organization",
      icon: <Building2Icon aria-hidden="true" />,
    },
  ],
};

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  session: {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role?: string | null;
    };
  };
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher organizations={data.organizations} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarMenu>
            {data.main.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  tooltip={item.title}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {session.user.role === "admin" ? (
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {data.platform.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
