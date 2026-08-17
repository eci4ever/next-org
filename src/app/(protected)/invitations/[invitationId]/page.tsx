import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { invitation, organization } from "@/db/schema";
import {
  acceptOrganizationInvitation,
  rejectOrganizationInvitation,
  requireSession,
} from "@/lib/session";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const current = await requireSession();
  const { invitationId } = await params;
  const rows = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      organizationName: organization.name,
    })
    .from(invitation)
    .innerJoin(organization, eq(organization.id, invitation.organizationId))
    .where(
      and(
        eq(invitation.id, invitationId),
        eq(invitation.email, current.user.email),
      ),
    )
    .limit(1);
  const item = rows[0];
  if (!item) notFound();

  const available = item.status === "pending" && item.expiresAt > new Date();
  async function accept(formData: FormData) {
    "use server";
    await acceptOrganizationInvitation(formData);
  }
  async function reject(formData: FormData) {
    "use server";
    await rejectOrganizationInvitation(formData);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      <PageHeader
        title="Organization invitation"
        description="Review your workspace invitation."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{item.organizationName}</CardTitle>
          <CardDescription>
            You were invited as {item.role ?? "member"}. This invitation expires{" "}
            {item.expiresAt.toLocaleString()}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {available ? (
            <div className="flex gap-2">
              <form action={accept}>
                <input type="hidden" name="invitationId" value={item.id} />
                <Button type="submit">Accept invitation</Button>
              </form>
              <form action={reject}>
                <input type="hidden" name="invitationId" value={item.id} />
                <Button type="submit" variant="outline">
                  Decline
                </Button>
              </form>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This invitation is{" "}
              {item.status === "pending" ? "expired" : item.status}.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
