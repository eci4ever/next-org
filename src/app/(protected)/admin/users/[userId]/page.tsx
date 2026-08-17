import {
  ArrowLeftIcon,
  MailCheckIcon,
  MailXIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RevokeAdminUserSessionButton } from "@/components/admin-user-detail";
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
import { getAdminUser } from "@/lib/admin-data";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const data = await getAdminUser(userId);
  if (!data) notFound();
  const { user, memberships, sessions, activity } = data;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      <PageHeader
        title={user.name}
        description="Platform user details and organization access."
      >
        <Button
          render={<Link href="/admin/users" />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Users
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={user.image ?? ""} alt={user.name} />
                  <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Platform role</p>
                <Badge
                  className="mt-1 capitalize"
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role ?? "user"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="mt-1 flex items-center gap-1.5 font-medium">
                  {user.emailVerified ? (
                    <MailCheckIcon className="size-4" />
                  ) : (
                    <MailXIcon className="size-4" />
                  )}
                  {user.emailVerified ? "Verified" : "Unverified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Two-factor authentication
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-medium">
                  <ShieldCheckIcon className="size-4" />
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account status</p>
                <Badge
                  className="mt-1"
                  variant={user.banned ? "destructive" : "outline"}
                >
                  {user.banned ? "Banned" : "Active"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="mt-1 font-medium">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              {user.banReason ? (
                <div>
                  <p className="text-xs text-muted-foreground">Ban reason</p>
                  <p className="mt-1 font-medium">{user.banReason}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization memberships</CardTitle>
              <CardDescription>
                Workspaces this user can access.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberships.length ? (
                    memberships.map((item) => (
                      <TableRow key={item.membershipId}>
                        <TableCell>
                          <Link
                            href={`/admin/organizations/${item.organizationId}`}
                            className="font-medium hover:underline"
                          >
                            {item.organizationName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {item.organizationSlug}
                          </p>
                        </TableCell>
                        <TableCell className="capitalize">
                          {item.role}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {item.organizationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.joinedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No organization memberships.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active sessions</CardTitle>
              <CardDescription>
                Review and revoke this user&apos;s signed-in devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length ? (
                <ul className="divide-y rounded-md border">
                  {sessions.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">
                          {item.ipAddress ?? "Unknown IP"}
                        </p>
                        <p className="max-w-xl truncate text-xs text-muted-foreground">
                          {item.userAgent ?? "Unknown device"} · active since{" "}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <RevokeAdminUserSessionButton
                        userId={user.id}
                        sessionId={item.id}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active sessions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Admin activity</CardTitle>
            <CardDescription>
              Recent platform-level account changes.
            </CardDescription>
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
                      {item.actorName ?? "System"} ·{" "}
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
      </div>
    </div>
  );
}
