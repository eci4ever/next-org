"use server";

import { and, count, desc, eq, gt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  auditLog,
  member,
  organization,
  session as sessionTable,
  user,
} from "@/db/schema";
import { platformAdminMutationError } from "@/lib/admin-policy";
import { auth, getSession } from "@/lib/auth";

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

/**
 * Get the current session or null.
 * Cached per-request via React `cache()` in `getSession`.
 */
export async function getSessionOrNull(): Promise<Session | null> {
  return getSession();
}

/**
 * Get the current session, or redirect to /login if unauthenticated.
 * Use this in protected pages and layouts.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Get the current session and verify the user is an admin.
 * Redirects to /dashboard if not an admin.
 * Use this in admin-only server actions and pages.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Check if the current user is an admin.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user.role === "admin";
}

export async function switchActiveOrganization(organizationId: string) {
  const current = await requireSession();
  const membership = await db
    .select({ id: member.id })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(
      and(
        eq(member.userId, current.user.id),
        eq(member.organizationId, organizationId),
        ne(organization.status, "archived"),
      ),
    )
    .limit(1);

  if (!membership.length) return { error: "Organization is not available." };

  try {
    await auth.api.setActiveOrganization({
      body: { organizationId },
      headers: await headers(),
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to switch organization.",
    };
  }
}

export async function acceptOrganizationInvitation(formData: FormData) {
  await requireSession();
  const invitationId = readString(formData, "invitationId");
  if (!invitationId) return { error: "Invitation is required." };

  try {
    await auth.api.acceptInvitation({
      body: { invitationId },
      headers: await headers(),
    });
    revalidatePath("/", "layout");
  } catch (error) {
    return { error: errorMessage(error, "Failed to accept invitation.") };
  }

  redirect("/dashboard");
}

export async function rejectOrganizationInvitation(formData: FormData) {
  await requireSession();
  const invitationId = readString(formData, "invitationId");
  if (!invitationId) return { error: "Invitation is required." };

  try {
    await auth.api.rejectInvitation({
      body: { invitationId },
      headers: await headers(),
    });
  } catch (error) {
    return { error: errorMessage(error, "Failed to reject invitation.") };
  }

  redirect("/dashboard");
}

export type ManagedSession = {
  id: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export async function listManagedSessions() {
  const current = await requireSession();
  const sessions = await db
    .select({
      id: sessionTable.id,
      expiresAt: sessionTable.expiresAt,
      createdAt: sessionTable.createdAt,
      updatedAt: sessionTable.updatedAt,
      ipAddress: sessionTable.ipAddress,
      userAgent: sessionTable.userAgent,
    })
    .from(sessionTable)
    .where(
      and(
        eq(sessionTable.userId, current.user.id),
        gt(sessionTable.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(sessionTable.updatedAt));

  return {
    currentSessionId: current.session.id,
    sessions: sessions.map((session) => ({
      ...session,
      expiresAt: session.expiresAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    })),
  };
}

export async function revokeManagedSession(sessionId: string) {
  const current = await requireSession();

  if (!sessionId || sessionId === current.session.id) {
    return { error: "The current session cannot be revoked here." };
  }

  await db
    .delete(sessionTable)
    .where(
      and(
        eq(sessionTable.id, sessionId),
        eq(sessionTable.userId, current.user.id),
      ),
    );

  return { success: true };
}

export async function revokeOtherManagedSessions() {
  const current = await requireSession();

  await db
    .delete(sessionTable)
    .where(
      and(
        eq(sessionTable.userId, current.user.id),
        ne(sessionTable.id, current.session.id),
      ),
    );

  return { success: true };
}

// ---------------------------------------------------------------------------
// Auth actions (sign in, sign up, sign out, profile, password)
// ---------------------------------------------------------------------------

export async function signIn(_prev: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";

    if (message.toLowerCase().includes("email not verified")) {
      return {
        error: "Please verify your email before signing in. Check your inbox.",
      };
    }

    return { error: message };
  }

  redirect("/dashboard");
}

export async function signUp(_prev: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }

  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}

export async function updateProfile(_prev: unknown, formData: FormData) {
  await requireSession();

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;

  try {
    await auth.api.updateUser({
      body: { name, image: image || null },
      headers: await headers(),
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to update profile",
    };
  }

  return { success: true };
}

export async function changePassword(_prev: unknown, formData: FormData) {
  await requireSession();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to change password",
    };
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Admin user actions
// ---------------------------------------------------------------------------

export type AdminUserActionState =
  | {
      error?: string;
      success?: string;
    }
  | undefined;

const USERS_PATH = "/admin/users";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readRole(formData: FormData) {
  const role = readString(formData, "role");
  return role === "admin" ? "admin" : "user";
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function isFinalPlatformAdmin(userId: string) {
  const [target, totals] = await Promise.all([
    db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
    db.select({ total: count() }).from(user).where(eq(user.role, "admin")),
  ]);
  return target[0]?.role === "admin" && (totals[0]?.total ?? 0) <= 1;
}

async function writeUserAudit(
  actorId: string,
  action: string,
  userId: string,
  metadata?: Record<string, unknown>,
) {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    actorId,
    action,
    entityType: "user",
    entityId: userId,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

export async function createAdminUser(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const name = readString(formData, "name");
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const role = readRole(formData);

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  try {
    const admin = await requireAdmin();
    const created = await auth.api.createUser({
      body: {
        name,
        email,
        role,
        password: password || undefined,
      },
      headers: await headers(),
    });
    await writeUserAudit(admin.user.id, "user.created", created.user.id, {
      role,
      email,
    });
  } catch (error) {
    return { error: errorMessage(error, "Failed to create user.") };
  }

  revalidatePath(USERS_PATH);
  return { success: "User created." };
}

export async function setAdminUserRole(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const userId = readString(formData, "userId");
  const role = readRole(formData);

  try {
    const session = await requireAdmin();

    const policyError = platformAdminMutationError({
      isSelf: userId === session.user.id,
      isFinalAdmin:
        role !== "admin" ? await isFinalPlatformAdmin(userId) : false,
      operation: "demote",
    });
    if (policyError) return { error: policyError };

    await auth.api.setRole({
      body: {
        userId,
        role,
      },
      headers: await headers(),
    });
    await writeUserAudit(session.user.id, "user.role_updated", userId, {
      role,
    });
  } catch (error) {
    return { error: errorMessage(error, "Failed to update role.") };
  }

  revalidatePath(USERS_PATH);
  return { success: "Role updated." };
}

export async function banAdminUser(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const userId = readString(formData, "userId");
  const banReason = readString(formData, "banReason");
  const banExpiresInValue = readString(formData, "banExpiresIn");
  const banExpiresIn = banExpiresInValue
    ? Number(banExpiresInValue)
    : undefined;

  try {
    const session = await requireAdmin();

    const policyError = platformAdminMutationError({
      isSelf: userId === session.user.id,
      isFinalAdmin: await isFinalPlatformAdmin(userId),
      operation: "ban",
    });
    if (policyError) return { error: policyError };

    await auth.api.banUser({
      body: {
        userId,
        banReason: banReason || undefined,
        banExpiresIn:
          typeof banExpiresIn === "number" && Number.isFinite(banExpiresIn)
            ? banExpiresIn
            : undefined,
      },
      headers: await headers(),
    });
    await writeUserAudit(session.user.id, "user.banned", userId, {
      banReason: banReason || null,
      banExpiresIn: banExpiresIn ?? null,
    });
  } catch (error) {
    return { error: errorMessage(error, "Failed to ban user.") };
  }

  revalidatePath(USERS_PATH);
  return { success: "User banned." };
}

export async function unbanAdminUser(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const userId = readString(formData, "userId");

  try {
    const session = await requireAdmin();
    await auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    });
    await writeUserAudit(session.user.id, "user.unbanned", userId);
  } catch (error) {
    return { error: errorMessage(error, "Failed to unban user.") };
  }

  revalidatePath(USERS_PATH);
  return { success: "User unbanned." };
}

export async function removeAdminUser(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const userId = readString(formData, "userId");

  try {
    const session = await requireAdmin();

    const policyError = platformAdminMutationError({
      isSelf: userId === session.user.id,
      isFinalAdmin: await isFinalPlatformAdmin(userId),
      operation: "delete",
    });
    if (policyError) return { error: policyError };

    await writeUserAudit(session.user.id, "user.deleted", userId);
    await auth.api.removeUser({
      body: { userId },
      headers: await headers(),
    });
  } catch (error) {
    return { error: errorMessage(error, "Failed to delete user.") };
  }

  revalidatePath(USERS_PATH);
  return { success: "User deleted." };
}

export async function impersonateAdminUser(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const userId = readString(formData, "userId");

  try {
    const session = await requireAdmin();

    const policyError = platformAdminMutationError({
      isSelf: userId === session.user.id,
      isFinalAdmin: false,
      operation: "impersonate",
    });
    if (policyError) return { error: policyError };

    await auth.api.impersonateUser({
      body: { userId },
      headers: await headers(),
    });
  } catch (error) {
    return { error: errorMessage(error, "Failed to impersonate user.") };
  }

  revalidatePath(USERS_PATH);
  redirect("/dashboard");
}
