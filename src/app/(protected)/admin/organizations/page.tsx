import { Building2Icon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import {
  CreateOrganizationDialog,
  OrganizationLogo,
} from "@/components/admin-organizations";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAdminOrganizations,
  type OrganizationStatus,
  organizationStatuses,
} from "@/lib/admin-data";

function statusVariant(status: OrganizationStatus) {
  if (status === "active") return "outline" as const;
  if (status === "suspended") return "destructive" as const;
  return "secondary" as const;
}

function pageHref(query: string, status: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return `/admin/organizations${suffix ? `?${suffix}` : ""}`;
}

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const requestedStatus =
    typeof params.status === "string" ? params.status : "all";
  const status = organizationStatuses.includes(
    requestedStatus as OrganizationStatus,
  )
    ? (requestedStatus as OrganizationStatus)
    : "all";
  const requestedPage =
    typeof params.page === "string" ? Number(params.page) : 1;
  const result = await getAdminOrganizations({
    query,
    status,
    page: requestedPage,
  });

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      <PageHeader
        title="Organizations"
        description="Manage platform workspaces, memberships, teams, and lifecycle status."
      >
        <CreateOrganizationDialog />
      </PageHeader>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        action="/admin/organizations"
      >
        <Input
          name="query"
          defaultValue={query}
          placeholder="Search by name or slug…"
          className="sm:max-w-xs"
        />
        <NativeSelect
          name="status"
          defaultValue={status}
          aria-label="Filter by status"
        >
          <NativeSelectOption value="all">All statuses</NativeSelectOption>
          <NativeSelectOption value="active">Active</NativeSelectOption>
          <NativeSelectOption value="suspended">Suspended</NativeSelectOption>
          <NativeSelectOption value="archived">Archived</NativeSelectOption>
        </NativeSelect>
        <Button type="submit" variant="outline" size="sm">
          Apply filters
        </Button>
        {query || status !== "all" ? (
          <Button
            render={<Link href="/admin/organizations" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
          >
            Reset
          </Button>
        ) : null}
      </form>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Members</TableHead>
                <TableHead className="text-right">Teams</TableHead>
                <TableHead className="text-right">Invitations</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.organizations.length ? (
                result.organizations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/admin/organizations/${item.id}`}
                        className="flex items-center gap-3 font-medium hover:underline"
                      >
                        <OrganizationLogo name={item.name} logo={item.logo} />
                        <span className="min-w-0">
                          <span className="block truncate">{item.name}</span>
                          <span className="block truncate text-xs font-normal text-muted-foreground">
                            {item.slug}
                          </span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant(item.status)}
                        className="capitalize"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.memberCount}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.teamCount}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.pendingInvitationCount}
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <Building2Icon className="mx-auto mb-2 size-8 text-muted-foreground" />
                    <p className="font-medium">No organizations found</p>
                    <p className="text-sm text-muted-foreground">
                      Change the filters or create the first organization.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{result.total} organization(s)</span>
        <div className="flex items-center gap-2">
          <span>
            Page {result.page} of {result.pageCount}
          </span>
          <Button
            render={<Link href={pageHref(query, status, result.page - 1)} />}
            nativeButton={false}
            variant="outline"
            size="icon-sm"
            disabled={result.page <= 1}
          >
            <ChevronLeftIcon />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            render={<Link href={pageHref(query, status, result.page + 1)} />}
            nativeButton={false}
            variant="outline"
            size="icon-sm"
            disabled={result.page >= result.pageCount}
          >
            <ChevronRightIcon />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
