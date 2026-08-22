import { describe, expect, it } from "vitest";
import {
  organizationAccessError,
  organizationCanReceiveActivity,
  organizationRoleAllows,
  platformRoleAllows,
} from "./authorization";
import { invitationDisplayStatus } from "./domain";

describe("platform authorization", () => {
  it("grants platform capabilities only to platform administrators", () => {
    expect(platformRoleAllows("admin", "platform.users.manage")).toBe(true);
    expect(platformRoleAllows("user", "platform.users.manage")).toBe(false);
  });
});

describe("organization authorization", () => {
  it("allows an active organization member to read their organization", () => {
    expect(
      organizationRoleAllows({
        platformRole: "user",
        organizationRole: "member",
        organizationStatus: "active",
        capability: "organization.read",
      }),
    ).toBe(true);
  });

  it("does not allow a member to manage other members", () => {
    expect(
      organizationRoleAllows({
        platformRole: "user",
        organizationRole: "member",
        organizationStatus: "active",
        capability: "organization.members.manage",
      }),
    ).toBe(false);
  });

  it("blocks ordinary access when an organization is suspended", () => {
    expect(
      organizationAccessError({
        platformRole: "user",
        organizationRole: "owner",
        organizationStatus: "suspended",
        capability: "organization.read",
      }),
    ).toBe("This organization is suspended.");
  });

  it("lets a platform administrator investigate a suspended organization", () => {
    expect(
      organizationRoleAllows({
        platformRole: "admin",
        organizationStatus: "suspended",
        capability: "organization.read",
      }),
    ).toBe(true);
  });

  it("allows new activity only for active organizations", () => {
    expect(organizationCanReceiveActivity("active")).toBe(true);
    expect(organizationCanReceiveActivity("suspended")).toBe(false);
    expect(organizationCanReceiveActivity("archived")).toBe(false);
  });
});

describe("invitation lifecycle", () => {
  it("presents an elapsed pending invitation as expired", () => {
    expect(
      invitationDisplayStatus({
        status: "pending",
        expiresAt: new Date("2026-01-01T00:00:00Z"),
        now: new Date("2026-01-02T00:00:00Z"),
      }),
    ).toBe("expired");
  });
});
