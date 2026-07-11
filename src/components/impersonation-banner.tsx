"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner({ userName }: { userName: string }) {
  const handleStop = async () => {
    await authClient.admin.stopImpersonating({});
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-between gap-4 bg-yellow-500/15 px-6 py-2.5 text-sm">
      <p className="text-foreground">
        You are signed in as <strong>{userName}</strong>. Actions are performed
        on their behalf.
      </p>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleStop}
      >
        Stop Impersonating
      </Button>
    </div>
  );
}
