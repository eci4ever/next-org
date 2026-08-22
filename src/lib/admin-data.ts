import "server-only";

import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLog,
  invitation,
  member,
  organization,
  session,
  team,
  teamMember,
  user,
} from "@/db/schema";
import { asOrganizationStatus, type OrganizationStatus } from "@/lib/domain";
import { requirePlatformCapability } from "@/lib/session";

export type { OrganizationStatus } from "@/lib/domain";
export { organizationStatuses } from "@/lib/domain";

export type AdminOrganizationRow = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  status: OrganizationStatus;
  createdAt: string;
  memberCount: number;
  teamCount: number;
  pendingInvitationCount: number;
};

export type AdminUserListRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string | null;
};

function serializeDate(value: Date | null) {
  return value?.toISOString() ?? null;
}

export async function getAdminOrganizations({
  query = "",
  status = "all",
  page = 1,
  pageSize = 20,
}: {
  query?: string;
  status?: OrganizationStatus | "all";
  page?: number;
  pageSize?: number;
} = {}) {
  await requirePlatformCapability("platform.organizations.read");

  const normalizedQuery = query.trim();
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safePageSize = Math.min(100, Math.max(10, pageSize));
  const filters = and(
    normalizedQuery
      ? or(
          ilike(organization.name, `%${normalizedQuery}%`),
          ilike(organization.slug, `%${normalizedQuery}%`),
        )
      : undefined,
    status !== "all" ? eq(organization.status, status) : undefined,
  );

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        status: organization.status,
        createdAt: organization.createdAt,
        memberCount: sql<number>`count(distinct ${member.id})`,
        teamCount: sql<number>`count(distinct ${team.id})`,
        pendingInvitationCount: sql<number>`count(distinct ${invitation.id}) filter (where ${invitation.status} = 'pending')`,
      })
      .from(organization)
      .leftJoin(member, eq(member.organizationId, organization.id))
      .leftJoin(team, eq(team.organizationId, organization.id))
      .leftJoin(invitation, eq(invitation.organizationId, organization.id))
      .where(filters)
      .groupBy(organization.id)
      .orderBy(desc(organization.createdAt))
      .limit(safePageSize)
      .offset((safePage - 1) * safePageSize),
    db.select({ total: count() }).from(organization).where(filters),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    organizations: rows.map(
      (row): AdminOrganizationRow => ({
        ...row,
        status: asOrganizationStatus(row.status),
        createdAt: row.createdAt.toISOString(),
        memberCount: Number(row.memberCount),
        teamCount: Number(row.teamCount),
        pendingInvitationCount: Number(row.pendingInvitationCount),
      }),
    ),
    total,
    page: safePage,
    pageSize: safePageSize,
    pageCount: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

export async function getAdminUsers({
  query = "",
  role = "all",
  status = "all",
  page = 1,
  pageSize = 20,
}: {
  query?: string;
  role?: "admin" | "user" | "all";
  status?: "active" | "banned" | "all";
  page?: number;
  pageSize?: number;
} = {}) {
  await requirePlatformCapability("platform.users.read");
  const normalizedQuery = query.trim();
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safePageSize = Math.min(100, Math.max(10, pageSize));
  const filters = and(
    normalizedQuery
      ? or(
          ilike(user.name, `%${normalizedQuery}%`),
          ilike(user.email, `%${normalizedQuery}%`),
        )
      : undefined,
    role !== "all" ? eq(user.role, role) : undefined,
    status === "banned"
      ? eq(user.banned, true)
      : status === "active"
        ? or(eq(user.banned, false), sql`${user.banned} is null`)
        : undefined,
  );

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(filters)
      .orderBy(desc(user.createdAt))
      .limit(safePageSize)
      .offset((safePage - 1) * safePageSize),
    db.select({ total: count() }).from(user).where(filters),
  ]);
  const total = totalResult[0]?.total ?? 0;

  return {
    users: rows.map(
      (row): AdminUserListRow => ({
        ...row,
        banned: row.banned === true,
        banExpires: serializeDate(row.banExpires),
        createdAt: serializeDate(row.createdAt),
      }),
    ),
    total,
    page: safePage,
    pageSize: safePageSize,
    pageCount: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

export async function getAdminOrganization(organizationId: string) {
  await requirePlatformCapability("platform.organizations.read");

  const [organizationRows, members, teams, teamMembers, invitations, activity] =
    await Promise.all([
      db
        .select()
        .from(organization)
        .where(eq(organization.id, organizationId))
        .limit(1),
      db
        .select({
          id: member.id,
          role: member.role,
          createdAt: member.createdAt,
          userId: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(eq(member.organizationId, organizationId))
        .orderBy(desc(member.createdAt)),
      db
        .select({
          id: team.id,
          name: team.name,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        })
        .from(team)
        .where(eq(team.organizationId, organizationId))
        .orderBy(desc(team.createdAt)),
      db
        .select({
          id: teamMember.id,
          teamId: teamMember.teamId,
          userId: user.id,
          name: user.name,
          email: user.email,
        })
        .from(teamMember)
        .innerJoin(team, eq(team.id, teamMember.teamId))
        .innerJoin(user, eq(user.id, teamMember.userId))
        .where(eq(team.organizationId, organizationId)),
      db
        .select({
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
        })
        .from(invitation)
        .where(eq(invitation.organizationId, organizationId))
        .orderBy(desc(invitation.createdAt)),
      db
        .select({
          id: auditLog.id,
          action: auditLog.action,
          metadata: auditLog.metadata,
          createdAt: auditLog.createdAt,
          actorName: user.name,
          actorEmail: user.email,
        })
        .from(auditLog)
        .leftJoin(user, eq(user.id, auditLog.actorId))
        .where(
          and(
            eq(auditLog.entityType, "organization"),
            eq(auditLog.entityId, organizationId),
          ),
        )
        .orderBy(desc(auditLog.createdAt))
        .limit(25),
    ]);

  const row = organizationRows[0];
  if (!row) return null;

  return {
    organization: {
      ...row,
      status: asOrganizationStatus(row.status),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      suspendedAt: serializeDate(row.suspendedAt),
      archivedAt: serializeDate(row.archivedAt),
    },
    members: members.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    teams: teams.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: serializeDate(item.updatedAt),
    })),
    teamMembers,
    invitations: invitations.map((item) => ({
      ...item,
      expiresAt: item.expiresAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
    })),
    activity: activity.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function getAdminUser(userId: string) {
  await requirePlatformCapability("platform.users.read");

  const [users, memberships, sessions, activity] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
    db
      .select({
        membershipId: member.id,
        role: member.role,
        joinedAt: member.createdAt,
        organizationId: organization.id,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        organizationStatus: organization.status,
      })
      .from(member)
      .innerJoin(organization, eq(organization.id, member.organizationId))
      .where(eq(member.userId, userId))
      .orderBy(desc(member.createdAt)),
    db
      .select({
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        expiresAt: session.expiresAt,
      })
      .from(session)
      .where(and(eq(session.userId, userId), sql`${session.expiresAt} > now()`))
      .orderBy(desc(session.updatedAt)),
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        metadata: auditLog.metadata,
        createdAt: auditLog.createdAt,
        actorName: user.name,
      })
      .from(auditLog)
      .leftJoin(user, eq(user.id, auditLog.actorId))
      .where(
        and(eq(auditLog.entityType, "user"), eq(auditLog.entityId, userId)),
      )
      .orderBy(desc(auditLog.createdAt))
      .limit(25),
  ]);

  const target = users[0];
  if (!target) return null;
  return {
    user: {
      ...target,
      banned: target.banned === true,
      createdAt: target.createdAt.toISOString(),
      updatedAt: target.updatedAt.toISOString(),
      banExpires: serializeDate(target.banExpires),
    },
    memberships: memberships.map((item) => ({
      ...item,
      organizationStatus: asOrganizationStatus(item.organizationStatus),
      joinedAt: item.joinedAt.toISOString(),
    })),
    sessions: sessions.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      expiresAt: item.expiresAt.toISOString(),
    })),
    activity: activity.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function writeAdminAuditEvent({
  actorId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  actorId: string;
  action: string;
  entityType: "organization" | "user" | "membership" | "invitation";
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    actorId,
    action,
    entityType,
    entityId,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}
