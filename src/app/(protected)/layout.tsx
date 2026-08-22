import { and, eq } from "drizzle-orm";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { db } from "@/db";
import { member, organization } from "@/db/schema";
import { requireSession } from "@/lib/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const organizations = await db
    .select({
      id: organization.id,
      name: organization.name,
      logo: organization.logo,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(
      and(
        eq(member.userId, session.user.id),
        eq(organization.status, "active"),
      ),
    );

  return (
    <SidebarProvider>
      <AppSidebar session={session} organizations={organizations} />
      <SidebarInset>
        {session.session.impersonatedBy ? (
          <ImpersonationBanner userName={session.user.name} />
        ) : null}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-10">
          <div className="flex flex-1 items-center gap-2 px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumbs />
          </div>
          <div className="px-4">
            <ThemeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
