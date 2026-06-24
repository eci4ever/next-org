"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, getSession } from "@/lib/auth";

export type AdminUserActionState =
  | {
      error?: string;
      success?: string;
    }
  | undefined;

type AdminSession = {
  user: {
    id: string;
    role?: string | null;
  };
};

const USERS_PATH = "/admin/users";

async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    throw new Error("You are not allowed to manage users.");
  }

  return session;
}

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
    await requireAdmin();
    await auth.api.createUser({
      body: {
        name,
        email,
        role,
        password: password || undefined,
      },
      headers: await headers(),
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

    if (userId === session.user.id) {
      return { error: "You cannot change your own role from this page." };
    }

    await auth.api.setRole({
      body: {
        userId,
        role,
      },
      headers: await headers(),
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

    if (userId === session.user.id) {
      return { error: "You cannot ban yourself." };
    }

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
    await requireAdmin();
    await auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    });
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

    if (userId === session.user.id) {
      return { error: "You cannot delete yourself." };
    }

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

    if (userId === session.user.id) {
      return { error: "You cannot impersonate yourself." };
    }

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
