export function getEmailFromInviteToken(token: string | undefined) {
  const encodedEmail = token?.split('_')[0];
  if (!encodedEmail || typeof atob !== 'function') return '';

  try {
    const normalized = encodedEmail.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const decoded = atob(padded);

    return decoded.includes('@') ? decoded : '';
  } catch {
    return '';
  }
}
