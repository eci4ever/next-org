"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ProfileForm({
  user,
}: {
  user: { name: string; image?: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image ?? "");
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  const hasChanges = name !== user.name || image !== (user.image ?? "");

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success("Profile updated successfully.");
      router.refresh();
    }
  }, [state, router.refresh]);

  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  function handleClearImage() {
    setImage("");
  }

  return (
    <form action={formAction} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">
            Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="image">Avatar URL</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="image"
              name="image"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="flex-1"
            />
            {image ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearImage}
              >
                Clear
              </Button>
            ) : null}
          </div>
          <FieldDescription>
            Provide a URL to an external image. Leave blank for no avatar.
          </FieldDescription>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
