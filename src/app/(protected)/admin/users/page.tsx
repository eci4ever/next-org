import dynamic from "next/dynamic";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminUserRow } from "@/components/admin-users-table";
import { AdminUsersTableSkeleton } from "@/components/admin-users-table";
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
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

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

  const usersResult = await auth.api.listUsers({
    query: { limit: 1000, sortBy: "createdAt", sortDirection: "desc" },
    headers: requestHeaders,
  });

  const serializedUsers = usersResult.users.map(serializeUser);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage platform users, roles, bans, and impersonation.
          </p>
        </div>
        <CreateUserDialog />
      </div>
      <AdminUsersTable
        users={serializedUsers}
        total={usersResult.total}
        currentUserId={session.user.id}
      />
    </div>
  );
}
