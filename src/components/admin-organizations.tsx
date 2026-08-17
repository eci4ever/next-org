"use client";

import { Building2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createAdminOrganization } from "@/lib/admin-actions";

export function CreateOrganizationDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    createAdminOrganization,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success(state.success);
      setOpen(false);
      router.refresh();
    }
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
        New organization
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Create a workspace. You will be assigned as its initial owner.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="organization-name">Name</FieldLabel>
            <Input id="organization-name" name="name" required minLength={2} />
          </Field>
          <Field>
            <FieldLabel htmlFor="organization-slug">Slug</FieldLabel>
            <Input
              id="organization-slug"
              name="slug"
              required
              minLength={2}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="acme-company"
            />
            <FieldDescription>
              Lowercase letters, numbers, and hyphens only.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="organization-logo">Logo URL</FieldLabel>
            <Input id="organization-logo" name="logo" type="url" />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function OrganizationLogo({
  name,
  logo,
  className = "size-9",
}: {
  name: string;
  logo: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      // biome-ignore lint/performance/noImgElement: Organization logos can be external URLs.
      <img
        src={logo}
        alt=""
        className={`${className} rounded-md border object-cover`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center rounded-md bg-muted text-muted-foreground`}
      title={name}
    >
      <Building2Icon className="size-4" aria-hidden="true" />
    </div>
  );
}
