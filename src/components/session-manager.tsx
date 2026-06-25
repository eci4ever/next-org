"use client";

import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SessionData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

function parseUserAgent(ua: string | null | undefined) {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "desktop" as const };

  const browser = ua.includes("Firefox")
    ? "Firefox"
    : ua.includes("Edg")
      ? "Edge"
      : ua.includes("Chrome")
        ? "Chrome"
        : ua.includes("Safari")
          ? "Safari"
          : "Unknown";

  const os = ua.includes("Windows")
    ? "Windows"
    : ua.includes("Mac")
      ? "macOS"
      : ua.includes("Linux")
        ? "Linux"
        : ua.includes("Android")
          ? "Android"
          : ua.includes("iPhone") || ua.includes("iPad")
            ? "iOS"
            : "Unknown";

  const device = ua.includes("Mobi")
    ? "mobile"
    : ua.includes("Tablet") || ua.includes("iPad")
      ? "tablet"
      : "desktop";

  return { browser, os, device: device as "desktop" | "mobile" | "tablet" };
}

const DeviceIcon = ({ device }: { device: "desktop" | "mobile" | "tablet" }) => {
  const className = "size-4 shrink-0 text-muted-foreground";
  if (device === "mobile") return <SmartphoneIcon className={className} aria-hidden="true" />;
  if (device === "tablet") return <TabletIcon className={className} aria-hidden="true" />;
  return <MonitorIcon className={className} aria-hidden="true" />;
};

function formatDate(date: Date) {
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
  const [currentToken, setCurrentToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    const current = await authClient.getSession();
    setCurrentToken(current.data?.session?.token ?? "");

    const list = await authClient.listSessions();
    if (list.data) {
      setSessions(list.data as SessionData[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (token: string) => {
    setRevoking(token);
    await authClient.revokeSession({ token });
    await fetchSessions();
    setRevoking(null);
  };

  const handleRevokeOthers = async () => {
    setRevoking("others");
    await authClient.revokeOtherSessions();
    await fetchSessions();
    setRevoking(null);
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
                  {revoking === "others" ? "Signing Out…" : "Sign Out All Other Sessions"}
                </Button>
              </div>
            )}
            <ul className="divide-y divide-border rounded-md border" role="list">
              {sessions.map((s) => {
                const info = parseUserAgent(s.userAgent);
                const isCurrent = s.token === currentToken;

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
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {s.ipAddress ?? "Unknown IP"} &middot; Active since {formatDate(s.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(s.token)}
                        disabled={revoking === s.token}
                        className="shrink-0"
                      >
                        {revoking === s.token ? "Signing Out…" : "Sign Out"}
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
