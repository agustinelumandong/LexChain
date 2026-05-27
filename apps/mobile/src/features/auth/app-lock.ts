import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

import { STORAGE_KEYS } from '@/constants';

export type DeviceLockStatus = 'success' | 'cancelled' | 'unavailable' | 'failed';

export type DeviceLockResult = {
  status: DeviceLockStatus;
  message?: string;
};

export async function getAppLockEnabled() {
  return (await AsyncStorage.getItem(STORAGE_KEYS.appLockEnabled)) === 'true';
}

export async function setAppLockEnabled(enabled: boolean) {
  if (enabled) {
    await AsyncStorage.setItem(STORAGE_KEYS.appLockEnabled, 'true');
    return;
  }

  await AsyncStorage.removeItem(STORAGE_KEYS.appLockEnabled);
}

export async function canUseDeviceLock(): Promise<DeviceLockResult> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return {
      status: 'unavailable',
      message: 'No device PIN, fingerprint, or face unlock is set up.',
    };
  }

  return { status: 'success' };
}

export async function authenticateWithDeviceLock(): Promise<DeviceLockResult> {
  const availability = await canUseDeviceLock();

  if (availability.status !== 'success') {
    return availability;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock LexChain',
    fallbackLabel: 'Use passcode',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });

  if (result.success) {
    return { status: 'success' };
  }

  if (result.error === 'user_cancel' || result.error === 'system_cancel' || result.error === 'app_cancel') {
    return { status: 'cancelled' };
  }

  return {
    status: 'failed',
    message: 'Device unlock failed. Try again.',
  };
}
