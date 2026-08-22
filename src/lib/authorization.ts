import type {
  OrganizationRole,
  OrganizationStatus,
  PlatformRole,
} from "@/lib/domain";

const platformCapabilities = [
  "platform.dashboard.read",
  "platform.users.read",
  "platform.users.manage",
  "platform.users.impersonate",
  "platform.organizations.read",
  "platform.organizations.manage",
  "platform.audit.read",
] as const;
export type PlatformCapability = (typeof platformCapabilities)[number];

const organizationCapabilities = [
  "organization.read",
  "organization.settings.manage",
  "organization.members.manage",
  "organization.teams.manage",
  "organization.invitations.manage",
] as const;
export type OrganizationCapability = (typeof organizationCapabilities)[number];

const platformGrants: Record<PlatformRole, readonly PlatformCapability[]> = {
  user: [],
  admin: platformCapabilities,
};

const organizationGrants: Record<
  OrganizationRole,
  readonly OrganizationCapability[]
> = {
  member: ["organization.read"],
  admin: [
    "organization.read",
    "organization.settings.manage",
    "organization.members.manage",
    "organization.teams.manage",
    "organization.invitations.manage",
  ],
  owner: organizationCapabilities,
};

export function platformRoleAllows(
  role: PlatformRole,
  capability: PlatformCapability,
) {
  return platformGrants[role].includes(capability);
}

export function organizationRoleAllows({
  platformRole,
  organizationRole,
  organizationStatus,
  capability,
}: {
  platformRole: PlatformRole;
  organizationRole?: OrganizationRole;
  organizationStatus: OrganizationStatus;
  capability: OrganizationCapability;
}) {
  if (platformRole === "admin") return true;
  if (organizationStatus !== "active" || !organizationRole) return false;
  return organizationGrants[organizationRole].includes(capability);
}

export function organizationCanReceiveActivity(
  status: OrganizationStatus,
): boolean {
  return status === "active";
}

export function organizationAccessError({
  platformRole,
  organizationRole,
  organizationStatus,
  capability,
}: {
  platformRole: PlatformRole;
  organizationRole?: OrganizationRole;
  organizationStatus: OrganizationStatus;
  capability: OrganizationCapability;
}) {
  if (
    organizationRoleAllows({
      platformRole,
      organizationRole,
      organizationStatus,
      capability,
    })
  ) {
    return null;
  }
  if (organizationStatus === "suspended") {
    return "This organization is suspended.";
  }
  if (organizationStatus === "archived") {
    return "This organization is archived.";
  }
  return "You do not have permission to perform this action.";
}
