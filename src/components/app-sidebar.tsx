"use client";

import { Building2Icon, LayoutDashboardIcon, UsersIcon } from "lucide-react";
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
      title: "Organizations",
      url: "/admin/organizations",
      icon: <Building2Icon aria-hidden="true" />,
    },
  ],
};

export function AppSidebar({
  session,
  organizations,
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
    session: { activeOrganizationId?: string | null };
  };
  organizations: {
    id: string;
    name: string;
    logo: string | null;
    role: string;
  }[];
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          organizations={organizations}
          activeOrganizationId={session.session.activeOrganizationId}
        />
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
