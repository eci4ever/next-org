import { ShieldAlertIcon } from "lucide-react";
import dynamic from "next/dynamic";
import type { AdminUserRow } from "@/components/admin-users-table";
import { AdminUsersTableSkeleton } from "@/components/admin-users-table";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getAdminUsers } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/session";

const AdminUsersTable = dynamic(
  () =>
    import("@/components/admin-users-table").then((m) => ({
      default: m.AdminUsersTable,
    })),
  {
    loading: () => <AdminUsersTableSkeleton />,
  },
);

const CreateUserDialog = dynamic(() =>
  import("@/components/admin-users-table").then((m) => ({
    default: m.CreateUserDialog,
  })),
);

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await requireAdmin();
  const query = typeof params.query === "string" ? params.query : "";
  const role =
    params.role === "admin" || params.role === "user" ? params.role : "all";
  const status =
    params.status === "active" || params.status === "banned"
      ? params.status
      : "all";
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  let usersResult: Awaited<ReturnType<typeof getAdminUsers>> | undefined;
  let fetchError = false;

  try {
    usersResult = await getAdminUsers({ query, role, status, page });
  } catch {
    fetchError = true;
  }

  if (fetchError || !usersResult) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
        <PageHeader
          title="Users"
          description="Manage platform users, roles, bans, and impersonation."
        />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldAlertIcon />
                </EmptyMedia>
                <EmptyTitle>Could not load users</EmptyTitle>
                <EmptyDescription>
                  Please try again. If the problem continues, contact support.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    users: serializedUsers,
    total,
    page: currentPage,
    pageCount,
  } = usersResult;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      <PageHeader
        title="Users"
        description="Manage platform users, roles, bans, and impersonation."
      >
        <CreateUserDialog />
      </PageHeader>
      <AdminUsersTable
        users={serializedUsers as AdminUserRow[]}
        currentUserId={session.user.id}
        serverPagination={{
          page: currentPage,
          pageCount,
          total,
          query,
          role,
          status,
        }}
      />
    </div>
  );
}
