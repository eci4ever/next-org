import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  type AdminUserRow,
  type AdminUsersFilters,
  AdminUsersTable,
} from "@/components/admin-users-table";
import { auth } from "@/lib/auth";

type SearchParams = Record<string, string | string[] | undefined>;

const defaultPageSize = 10;
const allowedPageSizes = new Set([10, 20, 50]);
const allowedSortFields = new Set(["createdAt", "email", "name"]);

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parsePageSize(value: string | undefined) {
  const parsed = parsePositiveInteger(value, defaultPageSize);
  return allowedPageSizes.has(parsed) ? parsed : defaultPageSize;
}

function parseSearchField(
  value: string | undefined,
): AdminUsersFilters["searchField"] {
  return value === "name" ? "name" : "email";
}

function parseRole(value: string | undefined): AdminUsersFilters["role"] {
  return value === "admin" || value === "user" ? value : "all";
}

function parseStatus(value: string | undefined): AdminUsersFilters["status"] {
  return value === "active" || value === "banned" ? value : "all";
}

function parseSort(value: string | undefined) {
  const [field, direction] = (value || "createdAt:desc").split(":");
  const sortBy = allowedSortFields.has(field) ? field : "createdAt";
  const sortDirection: "asc" | "desc" = direction === "asc" ? "asc" : "desc";

  return {
    sort: `${sortBy}:${sortDirection}`,
    sortBy,
    sortDirection,
  };
}

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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = parsePositiveInteger(firstParam(params.page), 1);
  const pageSize = parsePageSize(firstParam(params.pageSize));
  const q = firstParam(params.q)?.trim() ?? "";
  const searchField = parseSearchField(firstParam(params.searchField));
  const role = parseRole(firstParam(params.role));
  const status =
    role === "all" ? parseStatus(firstParam(params.status)) : "all";
  const { sort, sortBy, sortDirection } = parseSort(firstParam(params.sort));
  const query: {
    limit: number;
    offset: number;
    sortBy: string;
    sortDirection: "asc" | "desc";
    searchValue?: string;
    searchField?: "email" | "name";
    searchOperator?: "contains";
    filterField?: string;
    filterValue?: string | boolean;
    filterOperator?: "eq";
  } = {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    sortBy,
    sortDirection,
  };

  if (q) {
    query.searchValue = q;
    query.searchField = searchField;
    query.searchOperator = "contains";
  }

  if (role !== "all") {
    query.filterField = "role";
    query.filterValue = role;
    query.filterOperator = "eq";
  } else if (status !== "all") {
    query.filterField = "banned";
    query.filterValue = status === "banned";
    query.filterOperator = "eq";
  }

  const usersResult = await auth.api.listUsers({
    query,
    headers: requestHeaders,
  });

  const filters: AdminUsersFilters = {
    q,
    searchField,
    role,
    status,
    sort,
    page,
    pageSize,
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage platform users, roles, bans, and impersonation.
        </p>
      </div>
      <AdminUsersTable
        users={usersResult.users.map(serializeUser)}
        total={usersResult.total}
        filters={filters}
        currentUserId={session.user.id}
      />
    </div>
  );
}
