import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { getEmailFromInviteToken } from '../utils/invite-token';

export type AuthCallbackParams = Record<string, string>;

const CALLBACK_PATH = '/auth/callback';

function firstString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function appendParams(target: AuthCallbackParams, source: string) {
  const searchParams = new URLSearchParams(source);

  searchParams.forEach((value, key) => {
    if (value && !target[key]) {
      target[key] = value;
    }
  });
}

export function getAuthRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}${CALLBACK_PATH}`;
  }

  return Linking.createURL(CALLBACK_PATH);
}

export function normalizeAuthCallbackParams(
  params: Record<string, string | string[] | undefined>,
  callbackUrl?: string | null,
) {
  const normalized: AuthCallbackParams = {};

  Object.entries(params).forEach(([key, value]) => {
    const stringValue = firstString(value);

    if (stringValue) {
      normalized[key] = stringValue;
    }
  });

  if (callbackUrl) {
    const queryStart = callbackUrl.indexOf('?');
    const fragmentStart = callbackUrl.indexOf('#');

    if (queryStart >= 0) {
      const queryEnd = fragmentStart >= 0 ? fragmentStart : callbackUrl.length;
      appendParams(normalized, callbackUrl.slice(queryStart + 1, queryEnd));
    }

    if (fragmentStart >= 0) {
      appendParams(normalized, callbackUrl.slice(fragmentStart + 1));
    }
  }

  return normalized;
}

export function getInvitationRouteParams(params: AuthCallbackParams) {
  const invitationToken = params.token;
  const documentId = params.document_id ?? params.documentId;
  const role = params.role ?? params.permission;
  const email = params.email ?? getEmailFromInviteToken(invitationToken);

  return {
    ...(email ? { email } : null),
    ...(invitationToken ? { token: invitationToken } : null),
    ...(documentId ? { document_id: documentId } : null),
    ...(role ? { role } : null),
  };
}
