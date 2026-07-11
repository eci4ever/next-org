"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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

export async function updateProfile(_prev: unknown, formData: FormData) {
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

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}
