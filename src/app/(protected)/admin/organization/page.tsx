import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOrganizationPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      <PageHeader
        title="Organization"
        description="Manage your organization settings."
      />
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Organization settings are not yet available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
