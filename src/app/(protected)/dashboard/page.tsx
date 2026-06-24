import { headers } from "next/headers";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const session = await getSession();

  let totalUsers = 0;
  let totalAdmins = 0;
  let totalBanned = 0;

  try {
    const result = await auth.api.listUsers({
      query: { limit: 10000, sortBy: "createdAt", sortDirection: "desc" },
      headers: requestHeaders,
    });
    totalUsers = result.total;
    totalAdmins = result.users.filter((u) => u.role === "admin").length;
    totalBanned = result.users.filter((u) => u.banned).length;
  } catch {}

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session?.user.name ?? "User"}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {totalUsers}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {totalAdmins}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Banned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {totalBanned}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {totalUsers - totalBanned}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
