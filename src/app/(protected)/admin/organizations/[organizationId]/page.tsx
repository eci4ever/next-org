import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AddOrganizationMemberForm,
  AddTeamMemberForm,
  CancelOrganizationInvitationButton,
  CreateOrganizationTeamForm,
  DeleteOrganizationForm,
  DeleteOrganizationTeamButton,
  InviteOrganizationMemberForm,
  OrganizationMemberActions,
  OrganizationSettingsForm,
  OrganizationStatusForm,
  RemoveTeamMemberButton,
} from "@/components/admin-organization-detail";
import { OrganizationLogo } from "@/components/admin-organizations";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminOrganization } from "@/lib/admin-data";

export default async function AdminOrganizationDetailPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const data = await getAdminOrganization(organizationId);
  if (!data) notFound();

  const { organization, members, teams, teamMembers, invitations, activity } =
    data;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      <PageHeader
        title={organization.name}
        description={`Platform organization · ${organization.slug}`}
      >
        <Button
          render={<Link href="/admin/organizations" />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Organizations
        </Button>
      </PageHeader>

      <div className="flex items-center gap-3">
        <OrganizationLogo
          name={organization.name}
          logo={organization.logo}
          className="size-12"
        />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{organization.name}</h2>
            <Badge
              className="capitalize"
              variant={
                organization.status === "suspended"
                  ? "destructive"
                  : "secondary"
              }
            >
              {organization.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Created {new Date(organization.createdAt).toLocaleDateString()} ·{" "}
            {members.length} members
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General settings</CardTitle>
              <CardDescription>
                Update the organization identity and public logo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationSettingsForm organization={organization} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                Add existing platform users and manage organization roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <AddOrganizationMemberForm organizationId={organization.id} />
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage
                                src={item.image ?? ""}
                                alt={item.name}
                              />
                              <AvatarFallback>
                                {item.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <OrganizationMemberActions
                            organizationId={organization.id}
                            memberId={item.id}
                            role={item.role}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                Organize members into teams within this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <CreateOrganizationTeamForm organizationId={organization.id} />
              {teams.length ? (
                <ul className="divide-y rounded-md border">
                  {teams.map((item) => (
                    <li key={item.id} className="flex flex-col gap-3 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Created{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <DeleteOrganizationTeamButton
                          organizationId={organization.id}
                          teamId={item.id}
                        />
                      </div>
                      <AddTeamMemberForm
                        organizationId={organization.id}
                        teamId={item.id}
                      />
                      <ul className="flex flex-col gap-1">
                        {teamMembers
                          .filter((teamMember) => teamMember.teamId === item.id)
                          .map((teamMember) => (
                            <li
                              key={teamMember.id}
                              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                            >
                              <span>
                                {teamMember.name}{" "}
                                <span className="text-muted-foreground">
                                  ({teamMember.email})
                                </span>
                              </span>
                              <RemoveTeamMemberButton
                                organizationId={organization.id}
                                teamMembershipId={teamMember.id}
                                name={teamMember.name}
                              />
                            </li>
                          ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No teams yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Review and cancel organization invitations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <InviteOrganizationMemberForm
                  organizationId={organization.id}
                />
              </div>
              {invitations.length ? (
                <ul className="divide-y rounded-md border">
                  {invitations.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{item.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.role ?? "member"} · {item.status} · expires{" "}
                          {new Date(item.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      {item.status === "pending" ? (
                        <CancelOrganizationInvitationButton
                          organizationId={organization.id}
                          invitationId={item.id}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No invitations.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle</CardTitle>
              <CardDescription>
                Suspend, reactivate, or archive this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationStatusForm
                organizationId={organization.id}
                currentStatus={organization.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest platform-admin changes.</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length ? (
                <ol className="flex flex-col gap-4">
                  {activity.map((item) => (
                    <li key={item.id} className="border-l pl-3 text-sm">
                      <p className="font-medium">
                        {item.action.replaceAll(".", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.actorName ?? item.actorEmail ?? "System"} ·{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recorded activity yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="ring-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">
                Permanent deletion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeleteOrganizationForm
                organizationId={organization.id}
                slug={organization.slug}
                archived={organization.status === "archived"}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
