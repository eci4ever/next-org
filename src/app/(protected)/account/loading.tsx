import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
    return (
        <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex flex-col gap-0.5">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-56" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-12 rounded-full" />
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-28" />
                </CardContent>
            </Card>
        </div>
    );
}