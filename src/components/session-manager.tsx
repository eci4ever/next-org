"use client";

import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  listManagedSessions,
  type ManagedSession,
  revokeManagedSession,
  revokeOtherManagedSessions,
} from "@/lib/session";

type SessionData = ManagedSession;

function parseUserAgent(ua: string | null | undefined) {
  if (!ua)
    return { browser: "Unknown", os: "Unknown", device: "desktop" as const };

  const browser = ua.includes("Edg")
    ? "Edge"
    : ua.includes("Firefox") || ua.includes("FxiOS")
      ? "Firefox"
      : ua.includes("Chrome") || ua.includes("CriOS")
        ? "Chrome"
        : ua.includes("Safari")
          ? "Safari"
          : "Unknown";

  const os =
    ua.includes("iPhone") || ua.includes("iPad")
      ? "iOS"
      : ua.includes("Android")
        ? "Android"
        : ua.includes("Windows")
          ? "Windows"
          : ua.includes("Mac")
            ? "macOS"
            : ua.includes("Linux")
              ? "Linux"
              : "Unknown";

  const device =
    ua.includes("Tablet") || ua.includes("iPad")
      ? "tablet"
      : ua.includes("Mobi") || ua.includes("Android") || ua.includes("iPhone")
        ? "mobile"
        : "desktop";

  return { browser, os, device: device as "desktop" | "mobile" | "tablet" };
}

const DeviceIcon = ({
  device,
}: {
  device: "desktop" | "mobile" | "tablet";
}) => {
  const className = "size-4 shrink-0 text-muted-foreground";
  if (device === "mobile")
    return <SmartphoneIcon className={className} aria-hidden="true" />;
  if (device === "tablet")
    return <TabletIcon className={className} aria-hidden="true" />;
  return <MonitorIcon className={className} aria-hidden="true" />;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function SessionManager() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listManagedSessions();
      setCurrentSessionId(result.currentSessionId);
      setSessions(result.sessions);
    } catch (cause) {
      setSessions([]);
      const message =
        cause instanceof Error
          ? cause.message
          : "Unable to load your active sessions.";
      setError(message);
      toast.error("Could not load sessions", { description: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const result = await revokeManagedSession(sessionId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Session signed out.");
      await fetchSessions();
    } catch {
      toast.error("Failed to sign out this session. Please try again.");
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeOthers = async () => {
    setRevoking("others");
    try {
      await revokeOtherManagedSessions();

      toast.success("Other sessions signed out.");
      await fetchSessions();
    } catch {
      toast.error("Failed to sign out other sessions. Please try again.");
    } finally {
      setRevoking(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
        <CardDescription>
          Manage your active sessions across devices. You can sign out of
          individual sessions or all other sessions at once.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading sessions…</p>
        ) : error ? (
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            Retry loading sessions
          </Button>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active sessions found.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {sessions.length > 1 && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeOthers}
                  disabled={revoking === "others"}
                >
                  {revoking === "others"
                    ? "Signing Out…"
                    : "Sign Out All Other Sessions"}
                </Button>
              </div>
            )}
            <ul className="divide-y divide-border rounded-md border">
              {sessions.map((s) => {
                const info = parseUserAgent(s.userAgent);
                const isCurrent = s.id === currentSessionId;

                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <DeviceIcon device={info.device} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {info.browser} on {info.os}
                          </span>
                          {isCurrent && (
                            <Badge variant="default" className="shrink-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {s.ipAddress ?? "Unknown IP"} &middot; Active since{" "}
                          {formatDate(s.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(s.id)}
                        disabled={revoking === s.id}
                        className="shrink-0"
                      >
                        {revoking === s.id ? "Signing Out…" : "Sign Out"}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
