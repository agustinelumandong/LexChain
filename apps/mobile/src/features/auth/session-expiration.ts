import { router } from 'expo-router';
import { toast } from 'sonner-native';

import { clearSessionData } from './session-cleanup';

let isHandlingExpiredSession = false;

export async function handleExpiredSession() {
  if (isHandlingExpiredSession) {
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
