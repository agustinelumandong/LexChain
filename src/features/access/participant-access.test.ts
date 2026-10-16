import { PortalApiError } from '@/shared/api/portal-error';
import { describe, expect, it } from "vitest";
import { isParticipantAccessCapabilityError, validateParticipantInvitation } from "@/features/access/participant-access";

describe("participant access", () => {
  it("requires an email and one supported document permission for invitations", () => {
    expect(validateParticipantInvitation({ email: "", role: "viewer" }).valid).toBe(false);
    expect(validateParticipantInvitation({ email: "not-an-email", role: "viewer" }).valid).toBe(false);
    expect(validateParticipantInvitation({ email: "person@example.com", role: "" }).valid).toBe(false);
    expect(validateParticipantInvitation({ email: "person@example.com", role: "owner" }).valid).toBe(false);
    expect(validateParticipantInvitation({ email: "person@example.com", role: "viewer" })).toEqual({
      valid: true,
      value: { email: "person@example.com", role: "viewer" },
    });
  });

  it("recognizes a rejected participant-access capability response", () => {
    expect(isParticipantAccessCapabilityError(new Error("API error: 403"))).toBe(true);
    expect(isParticipantAccessCapabilityError(new Error("API error: 500"))).toBe(false);
  });
});

it('recognizes forbidden shared errors independently of their backend wording', () => {
  expect(isParticipantAccessCapabilityError(new PortalApiError('Document sharing is disabled.', 403, undefined))).toBe(true);
  expect(isParticipantAccessCapabilityError(new PortalApiError('Document unavailable.', 404, undefined))).toBe(false);
  expect(isParticipantAccessCapabilityError(new PortalApiError('Session rejected.', 401, undefined))).toBe(false);
});
