ALTER TABLE "platform_audit_log" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD COLUMN "request_id" text;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD COLUMN "severity" text DEFAULT 'info' NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "platform_audit_log" ADD CONSTRAINT "platform_audit_log_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "platformAuditLog_organizationId_idx" ON "platform_audit_log" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "platformAuditLog_requestId_idx" ON "platform_audit_log" USING btree ("request_id");