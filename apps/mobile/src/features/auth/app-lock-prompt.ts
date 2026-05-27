import { toast } from 'sonner-native';

import {
  authenticateWithDeviceLock,
  canUseDeviceLock,
  getAppLockEnabled,
  setAppLockEnabled,
} from './app-lock';
import { appLockDialogRef } from './components/app-lock-dialog';

export async function promptToEnableAppLock() {
  if (await getAppLockEnabled()) {
    return;
  }

  const availability = await canUseDeviceLock();

  if (availability.status !== 'success') {
    return;
  }

  const shouldEnable = await appLockDialogRef.current?.show();

  if (!shouldEnable) {
    return;
  }

  const result = await authenticateWithDeviceLock();

  if (result.status === 'success') {
    await setAppLockEnabled(true);
    toast.success('App Lock enabled');
    return;
  }

  if (result.status === 'failed') {
    toast.error(result.message ?? 'Device unlock failed');
  }
}
