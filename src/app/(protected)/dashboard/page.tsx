import { PageHeader } from "@/components/page-header";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session?.user.name ?? "User"}.`}
      />
      <p className="text-muted-foreground">
        Your dashboard is ready. More content coming soon.
      </p>
    </div>
  );
}
