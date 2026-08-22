import "server-only";

import { headers } from "next/headers";
import { db } from "@/db";
import { auditLog } from "@/db/schema";

export type AuditSeverity = "info" | "warning" | "critical";
export type AuditEntityType =
  | "organization"
  | "user"
  | "membership"
  | "invitation";

function forwardedIp(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export async function writeAuditEvent({
  actorId,
  action,
  entityType,
  entityId,
  organizationId,
  reason,
  severity = "info",
  metadata,
}: {
  actorId: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  organizationId?: string;
  reason?: string;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
}) {
  const requestHeaders = await headers();

  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    actorId,
    action,
    entityType,
    entityId,
    organizationId: organizationId ?? null,
    requestId: requestHeaders.get("x-request-id") ?? crypto.randomUUID(),
    reason: reason ?? null,
    severity,
    ipAddress: forwardedIp(requestHeaders.get("x-forwarded-for")),
    userAgent: requestHeaders.get("user-agent"),
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}
