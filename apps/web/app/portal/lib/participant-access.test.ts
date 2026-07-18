import { describe, expect, it } from "vitest";
import { canManageParticipants, validateParticipantInvitation } from "./participant-access";

describe("participant access", () => {
  it("allows only the Document Issuer to manage document participants", () => {
    expect(canManageParticipants("issuer")).toBe(true);
    expect(canManageParticipants("participant")).toBe(false);
    expect(canManageParticipants("unsupported")).toBe(false);
  });

  it("requires an email and one supported document permission for invitations", () => {
    expect(validateParticipantInvitation({ email: "", role: "viewer" }).valid).toBe(false);
    expect(validateParticipantInvitation({ email: "person@example.com", role: "" }).valid).toBe(false);
    expect(validateParticipantInvitation({ email: "person@example.com", role: "owner" }).valid).toBe(false);
    expect(validateParticipantInvitation({ email: "person@example.com", role: "viewer" })).toEqual({
      valid: true,
      value: { email: "person@example.com", role: "viewer" },
    });
  });
});
