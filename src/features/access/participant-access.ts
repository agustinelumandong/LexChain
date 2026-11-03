import { PortalApiError } from '@/shared/api/portal-error';

export const documentParticipantPermissions = ["viewer", "signer", "editor"] as const;

export type DocumentParticipantPermission = (typeof documentParticipantPermissions)[number];

export type ParticipantInvitation = {
  email: string;
  role: string;
};

export type ParticipantInvitationValidation =
  | { valid: true; value: { email: string; role: DocumentParticipantPermission } }
  | { valid: false; message: string };

export function validateParticipantInvitation(
  invitation: ParticipantInvitation,
): ParticipantInvitationValidation {
  const email = invitation.email.trim();
  if (!email) return { valid: false, message: "Enter a participant email address." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { valid: false, message: "Enter a valid participant email address." };

  if (!documentParticipantPermissions.includes(invitation.role as DocumentParticipantPermission)) {
    return { valid: false, message: "Choose a supported document permission." };
  }

  return { valid: true, value: { email, role: invitation.role as DocumentParticipantPermission } };
}

export function isParticipantAccessCapabilityError(reason: unknown): boolean {
  if (reason instanceof PortalApiError) return reason.status === 403;
  return reason instanceof Error && /\b403\b|forbidden|not permitted|capability/i.test(reason.message);
}

export function formatRelativeExpiry(expiresAt: string | null | undefined, nowMs: number = Date.now()): string | null {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  const time = date.getTime();
  if (Number.isNaN(time)) return null;

  const diffMs = time - nowMs;
  if (diffMs <= 0) return 'expired';

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays > 1) return `in ${diffDays} days`;
  if (diffDays === 1) return 'in 1 day';
  if (diffHours > 1) return `in ${diffHours} hours`;
  if (diffHours === 1) return 'in 1 hour';
  if (diffMinutes > 1) return `in ${diffMinutes} mins`;
  if (diffMinutes === 1) return 'in 1 min';
  return 'in less than a minute';
}
