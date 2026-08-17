import { describe, expect, it } from "vitest";
import {
  finalOwnerMutationError,
  platformAdminMutationError,
} from "./admin-policy";

describe("platform admin mutation policy", () => {
  it("blocks self-directed destructive actions", () => {
    expect(
      platformAdminMutationError({
        isSelf: true,
        isFinalAdmin: false,
        operation: "delete",
      }),
    ).toBe("You cannot delete yourself.");
  });

  it("blocks removing the final platform admin", () => {
    expect(
      platformAdminMutationError({
        isSelf: false,
        isFinalAdmin: true,
        operation: "demote",
      }),
    ).toBe("The final platform admin cannot be demoted.");
  });

  it("allows changes when another platform admin remains", () => {
    expect(
      platformAdminMutationError({
        isSelf: false,
        isFinalAdmin: false,
        operation: "delete",
      }),
    ).toBeNull();
  });
});

describe("organization ownership policy", () => {
  it("blocks removal of the final owner", () => {
    expect(
      finalOwnerMutationError({
        currentRole: "owner",
        otherOwnerCount: 0,
        operation: "remove",
      }),
    ).toBe("The final organization owner cannot be removed.");
  });

  it("allows ownership changes after assigning another owner", () => {
    expect(
      finalOwnerMutationError({
        currentRole: "owner",
        nextRole: "admin",
        otherOwnerCount: 1,
        operation: "change-role",
      }),
    ).toBeNull();
  });
});
