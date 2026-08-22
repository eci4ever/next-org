import type { OrganizationRole } from "@/lib/domain";

export function platformAdminMutationError({
  isSelf,
  isFinalAdmin,
  operation,
}: {
  isSelf: boolean;
  isFinalAdmin: boolean;
  operation: "demote" | "ban" | "delete" | "impersonate";
}) {
  if (isSelf) {
    if (operation === "demote")
      return "You cannot change your own role from this page.";
    if (operation === "ban") return "You cannot ban yourself.";
    if (operation === "delete") return "You cannot delete yourself.";
    return "You cannot impersonate yourself.";
  }
  if (isFinalAdmin && operation !== "impersonate") {
    const label =
      operation === "demote"
        ? "demoted"
        : operation === "ban"
          ? "banned"
          : "deleted";
    return `The final platform admin cannot be ${label}.`;
  }
  return null;
}

export function finalOwnerMutationError({
  currentRole,
  nextRole,
  otherOwnerCount,
  operation,
}: {
  currentRole: OrganizationRole;
  nextRole?: OrganizationRole;
  otherOwnerCount: number;
  operation: "change-role" | "remove";
}) {
  const removesOwnership =
    currentRole === "owner" &&
    (operation === "remove" ||
      (nextRole !== undefined && nextRole !== "owner"));
  if (!removesOwnership || otherOwnerCount > 0) return null;
  return operation === "remove"
    ? "The final organization owner cannot be removed."
    : "Assign another owner before changing the final owner.";
}
