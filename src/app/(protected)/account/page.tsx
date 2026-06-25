import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { SendResetLink } from "@/components/send-reset-link";
import { SessionManager } from "@/components/session-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
            <div className="flex flex-col gap-1">
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <SendResetLink email={user.email} />

      <SessionManager />
    </div>
  );
}
