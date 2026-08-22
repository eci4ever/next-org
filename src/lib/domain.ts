const platformRoles = ["user", "admin"] as const;
export type PlatformRole = (typeof platformRoles)[number];

export const organizationRoles = ["member", "admin", "owner"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

export const organizationStatuses = [
  "active",
  "suspended",
  "archived",
] as const;
export type OrganizationStatus = (typeof organizationStatuses)[number];

export function asPlatformRole(value: string | null | undefined): PlatformRole {
  return value === "admin" ? "admin" : "user";
}

export function asOrganizationRole(
  value: string | null | undefined,
): OrganizationRole {
  return value === "owner" || value === "admin" ? value : "member";
}

export function asOrganizationStatus(value: string): OrganizationStatus {
  return organizationStatuses.includes(value as OrganizationStatus)
    ? (value as OrganizationStatus)
    : "active";
}
