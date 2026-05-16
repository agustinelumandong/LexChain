import React from 'react';
import { toast } from 'sonner-native';

import {
  InfoRow,
  ProfileDetailScreen,
  SettingToggleRow,
  SettingsCard,
  type SecuritySettings,
  useProfileSettingsStore,
} from '@/features/profile';
import { Button } from '@/ui';

type SecurityToggleItem = {
  key: keyof SecuritySettings;
  iconName: React.ComponentProps<typeof SettingToggleRow>['iconName'];
  title: string;
  description: string;
};

const SECURITY_ITEMS: SecurityToggleItem[] = [
  {
    key: 'biometricUnlock',
    iconName: 'fingerprint',
    title: 'Biometric unlock preference',
    description: 'Store your preference for biometric unlock when native auth is connected.',
  },
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
  const security = useProfileSettingsStore((state) => state.security);
  const updateSecurity = useProfileSettingsStore((state) => state.updateSecurity);

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
        description="These toggles are visual preferences only and do not change authentication."
      >
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
