import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
    return (
        <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
            <PageHeader
                title="Users"
                description="Manage platform users, roles, bans, and impersonation."
            />
            <Card>
                <CardContent className="p-0">
                    <div className="flex flex-col">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
                            >
                                <Skeleton className="size-8 rounded-full" />
                                <div className="flex flex-1 flex-col gap-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-5 w-14 rounded-full" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}