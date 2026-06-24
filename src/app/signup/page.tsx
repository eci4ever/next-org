import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm />
      </div>
    </div>
  );
}
