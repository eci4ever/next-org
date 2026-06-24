import { ShieldAlertIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
import { auth, getSession } from "@/lib/auth";

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

function serializeDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
  createdAt?: Date | string | null;
}): AdminUserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role: user.role ?? null,
    banned: user.banned === true,
    banReason: user.banReason ?? null,
    banExpires: serializeDate(user.banExpires),
    createdAt: serializeDate(user.createdAt),
  };
}

export default async function AdminUsersPage() {
  const requestHeaders = await headers();
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  let usersResult: { users: ReturnType<typeof serializeUser>[]; total: number };
  let fetchError = false;

  try {
    const result = await auth.api.listUsers({
      query: { limit: 1000, sortBy: "createdAt", sortDirection: "desc" },
      headers: requestHeaders,
    });
    usersResult = {
      users: result.users.map(serializeUser),
      total: result.total,
    };
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
    <div className="flex flex-1 flex-col gap-6 p-6">
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

  const { users: serializedUsers, total } = usersResult!;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      <PageHeader
        title="Users"
        description="Manage platform users, roles, bans, and impersonation."
      >
        <CreateUserDialog />
      </PageHeader>
      <AdminUsersTable
        users={serializedUsers}
        currentUserId={session.user.id}
      />
    </div>
  );
}
