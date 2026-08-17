"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type AdminActionState,
  addAdminOrganizationMember,
  addAdminTeamMember,
  cancelAdminOrganizationInvitation,
  createAdminOrganizationTeam,
  deleteAdminOrganization,
  deleteAdminOrganizationTeam,
  inviteAdminOrganizationMember,
  removeAdminOrganizationMember,
  removeAdminTeamMember,
  setAdminOrganizationStatus,
  updateAdminOrganization,
  updateAdminOrganizationMember,
} from "@/lib/admin-actions";

type Action = (
  state: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

function useAdminAction(action: Action) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success(state.success);
      router.refresh();
    }
  }, [router, state]);

  return { formAction, pending };
}

export function OrganizationSettingsForm({
  organization,
}: {
  organization: { id: string; name: string; slug: string; logo: string | null };
}) {
  const { formAction, pending } = useAdminAction(updateAdminOrganization);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="organizationId" value={organization.id} />
      <label
        htmlFor="admin-organization-name"
        className="grid gap-1.5 text-sm font-medium"
      >
        Name
        <Input
          id="admin-organization-name"
          name="name"
          defaultValue={organization.name}
          required
        />
      </label>
      <label
        htmlFor="admin-organization-slug"
        className="grid gap-1.5 text-sm font-medium"
      >
        Slug
        <Input
          id="admin-organization-slug"
          name="slug"
          defaultValue={organization.slug}
          required
        />
      </label>
      <label
        htmlFor="admin-organization-logo"
        className="grid gap-1.5 text-sm font-medium sm:col-span-2"
      >
        Logo URL
        <Input
          id="admin-organization-logo"
          name="logo"
          type="url"
          defaultValue={organization.logo ?? ""}
        />
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

export function OrganizationStatusForm({
  organizationId,
  currentStatus,
}: {
  organizationId: string;
  currentStatus: "active" | "suspended" | "archived";
}) {
  const { formAction, pending } = useAdminAction(setAdminOrganizationStatus);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="organizationId" value={organizationId} />
      <label className="grid gap-1.5 text-sm font-medium">
        New status
        <select
          name="status"
          defaultValue={currentStatus === "active" ? "suspended" : "active"}
          className="h-9 rounded-md border bg-background px-3 font-normal"
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <label
        htmlFor="admin-organization-status-reason"
        className="grid gap-1.5 text-sm font-medium"
      >
        Reason
        <Input
          id="admin-organization-status-reason"
          name="reason"
          placeholder="Required for suspend or archive"
        />
      </label>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Updating…" : "Update status"}
      </Button>
    </form>
  );
}

export function AddOrganizationMemberForm({
  organizationId,
}: {
  organizationId: string;
}) {
  const { formAction, pending } = useAdminAction(addAdminOrganizationMember);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="organizationId" value={organizationId} />
      <Input
        name="email"
        type="email"
        placeholder="Existing user email"
        required
      />
      <select
        name="role"
        defaultValue="member"
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
        <option value="owner">Owner</option>
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add member"}
      </Button>
    </form>
  );
}

export function OrganizationMemberActions({
  organizationId,
  memberId,
  role,
}: {
  organizationId: string;
  memberId: string;
  role: string;
}) {
  const update = useAdminAction(updateAdminOrganizationMember);
  const remove = useAdminAction(removeAdminOrganizationMember);

  return (
    <div className="flex items-center justify-end gap-2">
      <form action={update.formAction} className="flex items-center gap-2">
        <input type="hidden" name="organizationId" value={organizationId} />
        <input type="hidden" name="memberId" value={memberId} />
        <select
          name="role"
          defaultValue={role}
          className="h-8 rounded-md border bg-background px-2 text-xs"
          aria-label="Membership role"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={update.pending}
        >
          Save
        </Button>
      </form>
      <form action={remove.formAction}>
        <input type="hidden" name="organizationId" value={organizationId} />
        <input type="hidden" name="memberId" value={memberId} />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          disabled={remove.pending}
        >
          <Trash2Icon />
          <span className="sr-only">Remove member</span>
        </Button>
      </form>
    </div>
  );
}

export function CreateOrganizationTeamForm({
  organizationId,
}: {
  organizationId: string;
}) {
  const { formAction, pending } = useAdminAction(createAdminOrganizationTeam);
  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <Input name="name" placeholder="Team name" minLength={2} required />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Creating…" : "Create team"}
      </Button>
    </form>
  );
}

export function DeleteOrganizationTeamButton({
  organizationId,
  teamId,
}: {
  organizationId: string;
  teamId: string;
}) {
  const { formAction, pending } = useAdminAction(deleteAdminOrganizationTeam);
  return (
    <form action={formAction}>
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="teamId" value={teamId} />
      <Button type="submit" variant="ghost" size="icon-sm" disabled={pending}>
        <Trash2Icon />
        <span className="sr-only">Delete team</span>
      </Button>
    </form>
  );
}

export function AddTeamMemberForm({
  organizationId,
  teamId,
}: {
  organizationId: string;
  teamId: string;
}) {
  const { formAction, pending } = useAdminAction(addAdminTeamMember);
  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="teamId" value={teamId} />
      <Input
        name="email"
        type="email"
        placeholder="Organization member email"
        required
      />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add"}
      </Button>
    </form>
  );
}

export function RemoveTeamMemberButton({
  organizationId,
  teamMembershipId,
  name,
}: {
  organizationId: string;
  teamMembershipId: string;
  name: string;
}) {
  const { formAction, pending } = useAdminAction(removeAdminTeamMember);
  return (
    <form action={formAction}>
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="teamMembershipId" value={teamMembershipId} />
      <Button type="submit" variant="ghost" size="icon-sm" disabled={pending}>
        <Trash2Icon />
        <span className="sr-only">Remove {name} from team</span>
      </Button>
    </form>
  );
}

export function CancelOrganizationInvitationButton({
  organizationId,
  invitationId,
}: {
  organizationId: string;
  invitationId: string;
}) {
  const { formAction, pending } = useAdminAction(
    cancelAdminOrganizationInvitation,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="invitationId" value={invitationId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Canceling…" : "Cancel invitation"}
      </Button>
    </form>
  );
}

export function InviteOrganizationMemberForm({
  organizationId,
}: {
  organizationId: string;
}) {
  const { formAction, pending } = useAdminAction(inviteAdminOrganizationMember);
  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="organizationId" value={organizationId} />
      <Input name="email" type="email" placeholder="Email address" required />
      <select
        name="role"
        defaultValue="member"
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
        <option value="owner">Owner</option>
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Sending…" : "Send invitation"}
      </Button>
    </form>
  );
}

export function DeleteOrganizationForm({
  organizationId,
  slug,
  archived,
}: {
  organizationId: string;
  slug: string;
  archived: boolean;
}) {
  const { formAction, pending } = useAdminAction(deleteAdminOrganization);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="organizationId" value={organizationId} />
      <p className="text-sm text-muted-foreground">
        Permanent deletion is only available after archival. Enter{" "}
        <strong>{slug}</strong> to confirm.
      </p>
      <Input
        name="confirmation"
        disabled={!archived}
        placeholder={slug}
        required
      />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={!archived || pending}
      >
        {pending ? "Deleting…" : "Delete permanently"}
      </Button>
    </form>
  );
}
