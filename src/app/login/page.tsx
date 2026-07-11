import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSessionOrNull } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSessionOrNull();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <GalleryVerticalEnd className="size-4" aria-hidden="true" />
          </div>
          <span className="text-base font-semibold tracking-tight">Nimfi</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
