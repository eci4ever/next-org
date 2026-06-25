import { MailCheckIcon, MailXIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { ResendVerification } from "@/components/resend-verification";
import { SecuritySettings } from "@/components/security-settings";
import { SendResetLink } from "@/components/send-reset-link";
import { SessionManager } from "@/components/session-manager";
import { DangerZone } from "@/components/danger-zone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      <PageHeader
        title="Account"
        description="Manage your profile and security settings."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.image ?? ""} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className="w-fit"
                >
                  {user.role === "admin" ? "Admin" : "User"}
                </Badge>
                <Badge
                  variant={user.emailVerified ? "secondary" : "destructive"}
                  className="w-fit gap-1"
                >
                  {user.emailVerified ? (
                    <MailCheckIcon className="size-3" aria-hidden="true" />
                  ) : (
                    <MailXIcon className="size-3" aria-hidden="true" />
                  )}
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
          {!user.emailVerified ? (
            <div className="mt-6">
              <ResendVerification email={user.email} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <SendResetLink email={user.email} />

      <SecuritySettings />

      <SessionManager />

      <DangerZone />
    </div>
  );
}
