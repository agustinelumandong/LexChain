import { router } from 'expo-router';
import { toast } from 'sonner-native';

import { authTokenStorage } from '@/shared/utils/secure-storage';

import { clearSessionData } from './session-cleanup';

let isHandlingExpiredSession = false;

export async function handleExpiredSession(requestToken?: string | null) {
  if (isHandlingExpiredSession) {
    return;
  }

  if (!requestToken) {
    return;
  }

  const currentToken = await authTokenStorage.get();

  if (currentToken !== requestToken) {
    return;
  }

  isHandlingExpiredSession = true;

  try {
    await clearSessionData();
    toast.error('Session expired. Please sign in again.');
    router.replace('/(auth)/sign-in');
  } finally {
    setTimeout(() => {
      isHandlingExpiredSession = false;
    }, 1000);
  }
}
