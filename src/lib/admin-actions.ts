"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import {
  invitation,
  member,
  organization,
  session as sessionTable,
  team,
  teamMember,
  user,
} from "@/db/schema";
import { finalOwnerMutationError } from "@/lib/admin-policy";
import { writeAuditEvent } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { organizationCanReceiveActivity } from "@/lib/authorization";
import {
  asOrganizationRole,
  asOrganizationStatus,
  organizationRoles,
  organizationStatuses,
} from "@/lib/domain";
import {
  buildAuthUrl,
  makeEmailTemplate,
  sendEmail,
} from "@/lib/email/email.service";
import { env } from "@/lib/env";
import { requirePlatformCapability } from "@/lib/session";

export type AdminActionState = { error?: string; success?: string } | undefined;

const requireOrganizationManager = () =>
  requirePlatformCapability("platform.organizations.manage");

async function writeAdminAuditEvent(
  event: Parameters<typeof writeAuditEvent>[0],
) {
  await writeAuditEvent({
    ...event,
    organizationId:
      event.organizationId ??
      (event.entityType === "organization" ? event.entityId : undefined),
  });
}

const organizationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .max(64)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens.",
    ),
  logo: z.string().trim().url("Logo must be a valid URL.").or(z.literal("")),
});

const memberRoleSchema = z.enum(organizationRoles);
const organizationStatusSchema = z.enum(organizationStatuses);

function value(formData: FormData, key: string) {
  const input = formData.get(key);
  return typeof input === "string" ? input.trim() : "";
}

function actionError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function organizationPath(organizationId: string) {
  return `/admin/organizations/${organizationId}`;
}

async function organizationActivityError(organizationId: string) {
  const rows = await db
    .select({ status: organization.status })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);
  const status = rows[0]?.status;
  if (!status) return "Organization not found.";
  if (!organizationCanReceiveActivity(asOrganizationStatus(status))) {
    return status === "suspended"
      ? "The organization is suspended."
      : "The organization is archived.";
  }
  return null;
}

function revalidateOrganization(organizationId?: string) {
  revalidatePath("/admin/organizations");
  if (organizationId) revalidatePath(organizationPath(organizationId));
  revalidatePath("/dashboard");
}

export async function createAdminOrganization(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = organizationSchema.safeParse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    logo: value(formData, "logo"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid organization.",
    };
  }

  try {
    const admin = await requireOrganizationManager();
    const created = await auth.api.createOrganization({
      body: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        logo: parsed.data.logo || undefined,
        keepCurrentActiveOrganization: true,
      },
      headers: await headers(),
    });

    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "organization.created",
      entityType: "organization",
      entityId: created.id,
      metadata: { name: created.name, slug: created.slug },
    });

    revalidateOrganization(created.id);
    return { success: "Organization created." };
  } catch (error) {
    return { error: actionError(error, "Failed to create organization.") };
  }
}

export async function updateAdminOrganization(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const parsed = organizationSchema.safeParse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    logo: value(formData, "logo"),
  });
  if (!organizationId || !parsed.success) {
    return {
      error: parsed.success
        ? "Organization is required."
        : (parsed.error.issues[0]?.message ?? "Invalid organization."),
    };
  }

  try {
    const admin = await requireOrganizationManager();
    const updated = await db
      .update(organization)
      .set({
        name: parsed.data.name,
        slug: parsed.data.slug,
        logo: parsed.data.logo || null,
        updatedAt: new Date(),
      })
      .where(eq(organization.id, organizationId))
      .returning({ id: organization.id });
    if (!updated.length) return { error: "Organization not found." };

    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "organization.updated",
      entityType: "organization",
      entityId: organizationId,
      metadata: parsed.data,
    });
    revalidateOrganization(organizationId);
    return { success: "Organization updated." };
  } catch (error) {
    return { error: actionError(error, "Failed to update organization.") };
  }
}

export async function setAdminOrganizationStatus(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const status = organizationStatusSchema.safeParse(value(formData, "status"));
  const reason = value(formData, "reason");
  if (!organizationId || !status.success) {
    return { error: "Invalid organization status." };
  }
  if (status.data !== "active" && !reason) {
    return { error: "A reason is required." };
  }

  try {
    const admin = await requireOrganizationManager();
    const updated = await db
      .update(organization)
      .set({
        status: status.data,
        statusReason: status.data === "active" ? null : reason,
        suspendedAt: status.data === "suspended" ? new Date() : null,
        archivedAt: status.data === "archived" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(organization.id, organizationId))
      .returning({ id: organization.id });
    if (!updated.length) return { error: "Organization not found." };
    if (status.data !== "active") {
      await db
        .update(sessionTable)
        .set({ activeOrganizationId: null, activeTeamId: null })
        .where(eq(sessionTable.activeOrganizationId, organizationId));
    }
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: `organization.${status.data}`,
      entityType: "organization",
      entityId: organizationId,
      reason: reason || undefined,
      severity: status.data === "active" ? "info" : "warning",
    });
    revalidateOrganization(organizationId);
    return {
      success:
        status.data === "active"
          ? "Organization reactivated."
          : `Organization ${status.data}.`,
    };
  } catch (error) {
    return {
      error: actionError(error, "Failed to update organization status."),
    };
  }
}

export async function deleteAdminOrganization(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const confirmation = value(formData, "confirmation");

  try {
    const admin = await requireOrganizationManager();
    const rows = await db
      .select({ slug: organization.slug, status: organization.status })
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);
    const target = rows[0];
    if (!target) return { error: "Organization not found." };
    if (target.status !== "archived") {
      return { error: "Archive the organization before deleting it." };
    }
    if (confirmation !== target.slug) {
      return { error: `Enter ${target.slug} to confirm deletion.` };
    }

    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "organization.deleted",
      entityType: "organization",
      entityId: organizationId,
      severity: "critical",
      metadata: { slug: target.slug },
    });
    await db.delete(organization).where(eq(organization.id, organizationId));
    revalidateOrganization();
  } catch (error) {
    return { error: actionError(error, "Failed to delete organization.") };
  }

  redirect("/admin/organizations");
}

export async function addAdminOrganizationMember(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const email = z
    .string()
    .email()
    .safeParse(value(formData, "email").toLowerCase());
  const role = memberRoleSchema.safeParse(value(formData, "role"));
  if (!organizationId || !email.success || !role.success) {
    return { error: "A valid email and role are required." };
  }

  try {
    const admin = await requireOrganizationManager();
    const activityError = await organizationActivityError(organizationId);
    if (activityError) return { error: activityError };
    const users = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email.data))
      .limit(1);
    const targetUser = users[0];
    if (!targetUser)
      return { error: "No platform user has that email address." };

    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId,
      userId: targetUser.id,
      role: role.data,
      createdAt: new Date(),
    });
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "membership.created",
      entityType: "organization",
      entityId: organizationId,
      metadata: { userId: targetUser.id, role: role.data },
    });
    revalidateOrganization(organizationId);
    return { success: "Member added." };
  } catch (error) {
    return {
      error: actionError(
        error,
        "Failed to add member. They may already belong to this organization.",
      ),
    };
  }
}

async function ownerCount(organizationId: string, excludedMemberId?: string) {
  const result = await db
    .select({ total: count() })
    .from(member)
    .where(
      and(
        eq(member.organizationId, organizationId),
        eq(member.role, "owner"),
        excludedMemberId ? ne(member.id, excludedMemberId) : undefined,
      ),
    );
  return result[0]?.total ?? 0;
}

export async function updateAdminOrganizationMember(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const memberId = value(formData, "memberId");
  const role = memberRoleSchema.safeParse(value(formData, "role"));
  if (!organizationId || !memberId || !role.success)
    return { error: "Invalid membership." };

  try {
    const admin = await requireOrganizationManager();
    const current = await db
      .select({ role: member.role, userId: member.userId })
      .from(member)
      .where(
        and(eq(member.id, memberId), eq(member.organizationId, organizationId)),
      )
      .limit(1);
    if (!current[0]) return { error: "Membership not found." };
    const policyError = finalOwnerMutationError({
      currentRole: asOrganizationRole(current[0].role),
      nextRole: role.data,
      otherOwnerCount: await ownerCount(organizationId, memberId),
      operation: "change-role",
    });
    if (policyError) return { error: policyError };

    await db
      .update(member)
      .set({ role: role.data })
      .where(eq(member.id, memberId));
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "membership.role_updated",
      entityType: "organization",
      entityId: organizationId,
      metadata: { memberId, userId: current[0].userId, role: role.data },
    });
    revalidateOrganization(organizationId);
    return { success: "Membership role updated." };
  } catch (error) {
    return { error: actionError(error, "Failed to update membership.") };
  }
}

export async function removeAdminOrganizationMember(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const memberId = value(formData, "memberId");

  try {
    const admin = await requireOrganizationManager();
    const current = await db
      .select({ role: member.role, userId: member.userId })
      .from(member)
      .where(
        and(eq(member.id, memberId), eq(member.organizationId, organizationId)),
      )
      .limit(1);
    if (!current[0]) return { error: "Membership not found." };
    const policyError = finalOwnerMutationError({
      currentRole: asOrganizationRole(current[0].role),
      otherOwnerCount: await ownerCount(organizationId, memberId),
      operation: "remove",
    });
    if (policyError) return { error: policyError };

    await db.delete(member).where(eq(member.id, memberId));
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "membership.removed",
      entityType: "organization",
      entityId: organizationId,
      metadata: { memberId, userId: current[0].userId },
    });
    revalidateOrganization(organizationId);
    return { success: "Member removed." };
  } catch (error) {
    return { error: actionError(error, "Failed to remove member.") };
  }
}

export async function createAdminOrganizationTeam(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const name = value(formData, "name");
  if (!organizationId || name.length < 2)
    return { error: "Team name is required." };

  try {
    const admin = await requireOrganizationManager();
    const activityError = await organizationActivityError(organizationId);
    if (activityError) return { error: activityError };
    const teamId = crypto.randomUUID();
    await db
      .insert(team)
      .values({ id: teamId, organizationId, name, createdAt: new Date() });
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "team.created",
      entityType: "organization",
      entityId: organizationId,
      metadata: { teamId, name },
    });
    revalidateOrganization(organizationId);
    return { success: "Team created." };
  } catch (error) {
    return { error: actionError(error, "Failed to create team.") };
  }
}

export async function deleteAdminOrganizationTeam(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const teamId = value(formData, "teamId");
  try {
    const admin = await requireOrganizationManager();
    await db
      .delete(team)
      .where(and(eq(team.id, teamId), eq(team.organizationId, organizationId)));
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "team.deleted",
      entityType: "organization",
      entityId: organizationId,
      metadata: { teamId },
    });
    revalidateOrganization(organizationId);
    return { success: "Team deleted." };
  } catch (error) {
    return { error: actionError(error, "Failed to delete team.") };
  }
}

export async function addAdminTeamMember(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const teamId = value(formData, "teamId");
  const email = z
    .string()
    .email()
    .safeParse(value(formData, "email").toLowerCase());
  if (!organizationId || !teamId || !email.success) {
    return { error: "A valid member email is required." };
  }

  try {
    const admin = await requireOrganizationManager();
    const activityError = await organizationActivityError(organizationId);
    if (activityError) return { error: activityError };
    const memberships = await db
      .select({ userId: member.userId })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .innerJoin(team, eq(team.organizationId, member.organizationId))
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(team.id, teamId),
          eq(user.email, email.data),
        ),
      )
      .limit(1);
    const membership = memberships[0];
    if (!membership) {
      return { error: "The user must first be an organization member." };
    }

    const teamMembershipId = crypto.randomUUID();
    await db.insert(teamMember).values({
      id: teamMembershipId,
      teamId,
      userId: membership.userId,
      createdAt: new Date(),
    });
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "team.member_added",
      entityType: "organization",
      entityId: organizationId,
      metadata: { teamId, userId: membership.userId },
    });
    revalidateOrganization(organizationId);
    return { success: "Team member added." };
  } catch (error) {
    return {
      error: actionError(
        error,
        "Failed to add team member. They may already be assigned.",
      ),
    };
  }
}

export async function removeAdminTeamMember(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const teamMembershipId = value(formData, "teamMembershipId");
  if (!organizationId || !teamMembershipId) {
    return { error: "Invalid team membership." };
  }

  try {
    const admin = await requireOrganizationManager();
    const rows = await db
      .select({
        id: teamMember.id,
        teamId: teamMember.teamId,
        userId: teamMember.userId,
      })
      .from(teamMember)
      .innerJoin(team, eq(team.id, teamMember.teamId))
      .where(
        and(
          eq(teamMember.id, teamMembershipId),
          eq(team.organizationId, organizationId),
        ),
      )
      .limit(1);
    if (!rows[0]) return { error: "Team membership not found." };

    await db.delete(teamMember).where(eq(teamMember.id, teamMembershipId));
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "team.member_removed",
      entityType: "organization",
      entityId: organizationId,
      metadata: { teamId: rows[0].teamId, userId: rows[0].userId },
    });
    revalidateOrganization(organizationId);
    return { success: "Team member removed." };
  } catch (error) {
    return { error: actionError(error, "Failed to remove team member.") };
  }
}

export async function cancelAdminOrganizationInvitation(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const invitationId = value(formData, "invitationId");
  try {
    const admin = await requireOrganizationManager();
    const canceled = await db
      .update(invitation)
      .set({ status: "canceled" })
      .where(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.organizationId, organizationId),
          eq(invitation.status, "pending"),
        ),
      )
      .returning({ id: invitation.id });
    if (!canceled.length) {
      return { error: "Pending invitation not found." };
    }
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "invitation.canceled",
      entityType: "organization",
      entityId: organizationId,
      metadata: { invitationId },
    });
    revalidateOrganization(organizationId);
    return { success: "Invitation canceled." };
  } catch (error) {
    return { error: actionError(error, "Failed to cancel invitation.") };
  }
}

export async function inviteAdminOrganizationMember(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const organizationId = value(formData, "organizationId");
  const email = z
    .string()
    .email()
    .safeParse(value(formData, "email").toLowerCase());
  const role = memberRoleSchema.safeParse(value(formData, "role"));
  if (!organizationId || !email.success || !role.success) {
    return { error: "A valid email and role are required." };
  }

  try {
    const admin = await requireOrganizationManager();
    const activityError = await organizationActivityError(organizationId);
    if (activityError) return { error: activityError };
    const [organizations, existingMembers, pendingInvitations] =
      await Promise.all([
        db
          .select({ name: organization.name })
          .from(organization)
          .where(eq(organization.id, organizationId))
          .limit(1),
        db
          .select({ id: member.id })
          .from(member)
          .innerJoin(user, eq(user.id, member.userId))
          .where(
            and(
              eq(member.organizationId, organizationId),
              eq(user.email, email.data),
            ),
          )
          .limit(1),
        db
          .select({ id: invitation.id })
          .from(invitation)
          .where(
            and(
              eq(invitation.organizationId, organizationId),
              eq(invitation.email, email.data),
              eq(invitation.status, "pending"),
            ),
          )
          .limit(1),
      ]);
    const targetOrganization = organizations[0];
    if (!targetOrganization) return { error: "Organization not found." };
    if (existingMembers.length)
      return { error: "This user is already a member." };

    const invitationId = pendingInvitations[0]?.id ?? crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    if (pendingInvitations.length) {
      await db
        .update(invitation)
        .set({ role: role.data, expiresAt, inviterId: admin.user.id })
        .where(eq(invitation.id, invitationId));
    } else {
      await db.insert(invitation).values({
        id: invitationId,
        organizationId,
        email: email.data,
        role: role.data,
        status: "pending",
        expiresAt,
        inviterId: admin.user.id,
      });
    }

    const delivery = await sendEmail(env, {
      to: email.data,
      template: makeEmailTemplate(env, "organization-invitation", {
        organizationName: targetOrganization.name,
        actionUrl: buildAuthUrl(env, `/invitations/${invitationId}`),
      }),
    });
    if (!delivery.ok) {
      return {
        error: `Invitation saved, but email delivery failed: ${delivery.error}`,
      };
    }

    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: pendingInvitations.length
        ? "invitation.resent"
        : "invitation.created",
      entityType: "organization",
      entityId: organizationId,
      metadata: { invitationId, email: email.data, role: role.data },
    });
    revalidateOrganization(organizationId);
    return {
      success: pendingInvitations.length
        ? "Invitation resent."
        : "Invitation sent.",
    };
  } catch (error) {
    return { error: actionError(error, "Failed to send invitation.") };
  }
}

export async function revokeAdminUserSession(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const userId = value(formData, "userId");
  const sessionId = value(formData, "sessionId");
  if (!userId || !sessionId) return { error: "Invalid session." };

  try {
    const admin = await requirePlatformCapability("platform.users.manage");
    const removed = await db
      .delete(sessionTable)
      .where(
        and(eq(sessionTable.id, sessionId), eq(sessionTable.userId, userId)),
      )
      .returning({ id: sessionTable.id });
    if (!removed.length) return { error: "Session not found." };
    await writeAdminAuditEvent({
      actorId: admin.user.id,
      action: "user.session_revoked",
      entityType: "user",
      entityId: userId,
      metadata: { sessionId },
    });
    revalidatePath(`/admin/users/${userId}`);
    return { success: "Session revoked." };
  } catch (error) {
    return { error: actionError(error, "Failed to revoke session.") };
  }
}
