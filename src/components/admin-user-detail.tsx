"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { revokeAdminUserSession } from "@/lib/admin-actions";

export function RevokeAdminUserSessionButton({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    revokeAdminUserSession,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success(state.success);
      router.refresh();
    }
  }, [router, state]);

  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="sessionId" value={sessionId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Revoking…" : "Revoke"}
      </Button>
    </form>
  );
}
