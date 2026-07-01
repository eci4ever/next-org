import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
            <GalleryVerticalEnd className="size-5" aria-hidden="true" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">Nimfi</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
