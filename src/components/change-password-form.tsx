"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { changePassword } from "@/actions/auth"

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success("Password changed successfully.")
  }, [state])

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Changing..." : "Change Password"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
