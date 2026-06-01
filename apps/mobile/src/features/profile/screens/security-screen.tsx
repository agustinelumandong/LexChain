import React from 'react';
import { toast } from 'sonner-native';

import {
  authenticateWithDeviceLock,
  getAppLockEnabled,
  setAppLockEnabled,
} from '@/features/auth/app-lock';
import { Button } from '@/ui';

import { ProfileDetailScreen } from '../profile-detail-screen';
import { InfoRow } from '../profile-info-row';
import {
  type SecuritySettings,
  useProfileSettingsStore,
} from '../profile-settings-store';
import { SettingToggleRow } from '../setting-toggle-row';
import { SettingsCard } from '../settings-card';

type SecurityToggleItem = {
  key: keyof SecuritySettings;
  iconName: React.ComponentProps<typeof SettingToggleRow>['iconName'];
  title: string;
  description: string;
};

const SECURITY_ITEMS: SecurityToggleItem[] = [
  {
    key: 'fasterSignIn',
    iconName: 'bolt',
    title: 'Faster sign-in preference',
    description: 'Keep this device ready for quicker future authentication flows.',
  },
  {
    key: 'trustedDeviceAlerts',
    iconName: 'devices',
    title: 'Trusted device alerts',
    description: 'Flag new or unusual sign-in activity when session APIs are available.',
  },
];

export default function SecurityScreen() {
  const [appLockEnabled, setAppLockEnabledState] = React.useState(false);
  const [isUpdatingAppLock, setIsUpdatingAppLock] = React.useState(false);
  const security = useProfileSettingsStore((state) => state.security);
  const updateSecurity = useProfileSettingsStore((state) => state.updateSecurity);

  React.useEffect(() => {
    void getAppLockEnabled().then((enabled) => {
      setAppLockEnabledState(enabled);
      updateSecurity('biometricUnlock', enabled);
    });
  }, [updateSecurity]);

  const handleAppLockChange = async (value: boolean) => {
    if (isUpdatingAppLock) {
      return;
    }

    setIsUpdatingAppLock(true);

    try {
      if (!value) {
        await setAppLockEnabled(false);
        setAppLockEnabledState(false);
        updateSecurity('biometricUnlock', false);
        toast.success('App Lock disabled');
        return;
      }

      const result = await authenticateWithDeviceLock();

      if (result.status !== 'success') {
        if (result.status === 'unavailable') {
          toast.warning(result.message ?? 'Device lock is not available on this phone.');
          return;
        }

        if (result.status === 'failed') {
          toast.error(result.message ?? 'Device unlock failed');
          return;
        }

        toast.warning('App Lock was not enabled');
        return;
      }

      await setAppLockEnabled(true);
      setAppLockEnabledState(true);
      updateSecurity('biometricUnlock', true);
      toast.success('App Lock enabled');
    } finally {
      setIsUpdatingAppLock(false);
    }
  };

  const handleChange = (key: keyof SecuritySettings, value: boolean) => {
    updateSecurity(key, value);
    toast.success(value ? 'Security preference enabled' : 'Security preference disabled');
  };

  return (
    <ProfileDetailScreen
      title="Security"
      subtitle="Review account protection and local security preferences."
    >
      <SettingsCard
        title="Account protection"
        description="Current backend auth supports sign-in, sign-up, and email verification."
      >
        <InfoRow
          iconName="mark-email-read"
          title="Email verification"
          body="Verified email is required before signing in when Supabase verification is enabled."
        />
        <InfoRow
          iconName="vpn-key"
          title="Password changes"
          body="Password update is not connected yet because the API contract has no endpoint for it."
        />
        <Button
          label="Change password"
          variant="secondary"
          fullWidth
          onPress={() => toast('Password changes need backend support first')}
        />
      </SettingsCard>

      <SettingsCard
        title="Local preferences"
        description="App Lock protects LexChain on this device with your phone unlock method."
      >
        <SettingToggleRow
          iconName="fingerprint"
          title="App Lock"
          description="Require fingerprint, face unlock, PIN, pattern, or passcode on cold app open."
          value={appLockEnabled}
          onValueChange={handleAppLockChange}
        />

        {SECURITY_ITEMS.map((item) => (
          <SettingToggleRow
            key={item.key}
            iconName={item.iconName}
            title={item.title}
            description={item.description}
            value={security[item.key]}
            onValueChange={(value) => handleChange(item.key, value)}
          />
        ))}
      </SettingsCard>
    </ProfileDetailScreen>
  );
}
