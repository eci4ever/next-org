"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(_prev: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : "An unexpected error occurred" }
  }

  redirect("/dashboard")
}

export async function signUp(_prev: unknown, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : "An unexpected error occurred" }
  }

  redirect("/dashboard")
}

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  })

  redirect("/")
}
