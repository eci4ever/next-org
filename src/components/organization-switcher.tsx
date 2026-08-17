"use client";

import { Building2Icon, ChevronsUpDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { switchActiveOrganization } from "@/lib/session";

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
}: {
  organizations: {
    id: string;
    name: string;
    logo: string | null;
    role: string;
  }[];
  activeOrganizationId?: string | null;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const activeOrg =
    organizations.find(
      (organization) => organization.id === activeOrganizationId,
    ) ?? organizations[0];
  if (!activeOrg) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent">
              <Building2Icon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No organization</span>
              <span className="truncate text-xs">Awaiting membership</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  function switchOrganization(organizationId: string) {
    if (organizationId === activeOrg?.id) return;
    startTransition(async () => {
      const result = await switchActiveOrganization(organizationId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  const Logo = ({
    organization,
  }: {
    organization: (typeof organizations)[number];
  }) =>
    organization.logo ? (
      // biome-ignore lint/performance/noImgElement: Organization logos may be external.
      <img
        src={organization.logo}
        alt=""
        className="size-full rounded-md object-cover"
      />
    ) : (
      <Building2Icon className="size-4" aria-hidden="true" />
    );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                disabled={pending}
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Logo organization={activeOrg} />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeOrg.name}</span>
              <span className="truncate text-xs capitalize">
                {activeOrg.role}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org, index) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => switchOrganization(org.id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Logo organization={org} />
                  </div>
                  {org.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
