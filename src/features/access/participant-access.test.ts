import { PortalApiError } from '@/shared/api/portal-error';
import { describe, expect, it } from "vitest";
import { formatRelativeExpiry, isParticipantAccessCapabilityError, validateParticipantInvitation } from "@/features/access/participant-access";

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

describe('formatRelativeExpiry', () => {
  const baseTime = 1700000000000;

  it('handles null, undefined and invalid timestamps', () => {
    expect(formatRelativeExpiry(null)).toBeNull();
    expect(formatRelativeExpiry(undefined)).toBeNull();
    expect(formatRelativeExpiry('not-a-date')).toBeNull();
  });

  it('detects expired timestamps', () => {
    const past = new Date(baseTime - 1000).toISOString();
    expect(formatRelativeExpiry(past, baseTime)).toBe('expired');
  });

  it('formats future days, hours, and minutes', () => {
    const in7Days = new Date(baseTime + 7 * 24 * 60 * 60 * 1000).toISOString();
    const in1Day = new Date(baseTime + 24 * 60 * 60 * 1000 + 1000).toISOString();
    const in5Hours = new Date(baseTime + 5 * 60 * 60 * 1000).toISOString();
    const in1Hour = new Date(baseTime + 60 * 60 * 1000).toISOString();
    const in30Mins = new Date(baseTime + 30 * 60 * 1000).toISOString();
    const inLessMinute = new Date(baseTime + 30 * 1000).toISOString();

    expect(formatRelativeExpiry(in7Days, baseTime)).toBe('in 7 days');
    expect(formatRelativeExpiry(in1Day, baseTime)).toBe('in 1 day');
    expect(formatRelativeExpiry(in5Hours, baseTime)).toBe('in 5 hours');
    expect(formatRelativeExpiry(in1Hour, baseTime)).toBe('in 1 hour');
    expect(formatRelativeExpiry(in30Mins, baseTime)).toBe('in 30 mins');
    expect(formatRelativeExpiry(inLessMinute, baseTime)).toBe('in less than a minute');
  });
});
