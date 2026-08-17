import { eq } from "drizzle-orm";
import {
  Building2Icon,
  CalendarDaysIcon,
  MailCheckIcon,
  MailXIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { member, organization } from "@/db/schema";
import { requireSession } from "@/lib/session";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRoundIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="truncate font-medium">{value}</div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();
  const memberships = await db
    .select({
      organizationId: organization.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      organizationLogo: organization.logo,
      memberRole: member.role,
      joinedAt: member.createdAt,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, session.user.id));

  const activeOrganization =
    memberships.find(
      (membership) =>
        membership.organizationId === session.session.activeOrganizationId,
    ) ?? memberships[0];
  const userRole = session.user.role === "admin" ? "Admin" : "User";

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session.user.name}. Here’s an overview of your account.`}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarImage
                  src={session.user.image ?? ""}
                  alt={session.user.name}
                />
                <AvatarFallback>
                  {session.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="truncate">{session.user.name}</CardTitle>
                <CardDescription className="truncate">
                  {session.user.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              icon={ShieldCheckIcon}
              label="Account role"
              value={<Badge variant="secondary">{userRole}</Badge>}
            />
            <InfoRow
              icon={session.user.emailVerified ? MailCheckIcon : MailXIcon}
              label="Email status"
              value={session.user.emailVerified ? "Verified" : "Unverified"}
            />
            <InfoRow
              icon={CalendarDaysIcon}
              label="Member since"
              value={formatDate(session.user.createdAt)}
            />
            <InfoRow
              icon={Building2Icon}
              label="Organizations"
              value={`${memberships.length} ${memberships.length === 1 ? "organization" : "organizations"}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              {activeOrganization
                ? "Your current workspace and membership details."
                : "Your workspace information will appear here."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeOrganization ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow
                  icon={Building2Icon}
                  label="Organization"
                  value={activeOrganization.organizationName}
                />
                <InfoRow
                  icon={ShieldCheckIcon}
                  label="Organization role"
                  value={
                    <span className="capitalize">
                      {activeOrganization.memberRole}
                    </span>
                  }
                />
                <InfoRow
                  icon={UserRoundIcon}
                  label="Workspace slug"
                  value={activeOrganization.organizationSlug}
                />
                <InfoRow
                  icon={CalendarDaysIcon}
                  label="Joined organization"
                  value={formatDate(activeOrganization.joinedAt)}
                />
              </div>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
                <Building2Icon
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-medium">No organization yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Ask an organization owner to invite you to a workspace.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
