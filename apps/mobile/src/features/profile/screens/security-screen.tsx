import React from 'react';
import * as Linking from 'expo-linking';
import { toast } from 'sonner-native';

import {
  authenticateWithDeviceLock,
  getAppLockEnabled,
  setAppLockEnabled,
} from '@/features/auth/app-lock';
import {
  useDisableMfa,
  useEnableMfa,
  useSetupMfa,
  useUserProfile,
} from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { Button } from '@/ui';

import { ProfileDetailScreen } from '../profile-detail-screen';
import { profileDetailStyles } from '../profile-detail.styles';
import { InfoRow } from '../profile-info-row';
import { ProfileTextField } from '../profile-text-field';
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
  const [mfaCode, setMfaCode] = React.useState('');
  const [mfaDisableCode, setMfaDisableCode] = React.useState('');
  const [mfaSetup, setMfaSetup] = React.useState<{
    secret: string;
    provisioning_uri: string;
  } | null>(null);
  const security = useProfileSettingsStore((state) => state.security);
  const updateSecurity = useProfileSettingsStore((state) => state.updateSecurity);
  const userProfileQuery = useUserProfile();
  const setupMfaMutation = useSetupMfa();
  const enableMfaMutation = useEnableMfa();
  const disableMfaMutation = useDisableMfa();
  const mfaEnabled = Boolean(userProfileQuery.data?.mfa_enabled);
  const isMfaBusy =
    setupMfaMutation.isPending ||
    enableMfaMutation.isPending ||
    disableMfaMutation.isPending;

  React.useEffect(() => {
    void getAppLockEnabled().then((enabled) => {
      setAppLockEnabledState(enabled);
      updateSecurity('biometricUnlock', enabled);
    });
  }, [updateSecurity]);

  React.useEffect(() => {
    if (mfaEnabled) {
      setMfaSetup(null);
      setMfaCode('');
    }
  }, [mfaEnabled]);

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
    } catch (error) {
      toast.error(parseApiError(error).message);
    } finally {
      setIsUpdatingAppLock(false);
    }
  };

  const handleChange = (key: keyof SecuritySettings, value: boolean) => {
    updateSecurity(key, value);
    toast.success(value ? 'Security preference enabled' : 'Security preference disabled');
  };

  const handleSetupMfa = async () => {
    try {
      const setup = await setupMfaMutation.mutateAsync();

      setMfaSetup(setup);
      setMfaCode('');
      toast.success('MFA setup started');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleEnableMfa = async () => {
    const code = mfaCode.trim();

    if (!/^\d{6}$/.test(code)) {
      toast.warning('Enter a 6-digit authenticator code');
      return;
    }

    try {
      await enableMfaMutation.mutateAsync({ code });
      setMfaSetup(null);
      setMfaCode('');
      toast.success('MFA enabled');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  const handleOpenAuthenticatorApp = async () => {
    if (!mfaSetup?.provisioning_uri) {
      toast.warning('MFA setup link is not ready yet');
      return;
    }

    try {
      await Linking.openURL(mfaSetup.provisioning_uri);
      toast.info('Return to LexChain and enter the 6-digit code');
    } catch {
      toast.warning('No authenticator app opened. Use the manual secret below.');
    }
  };

  const handleDisableMfa = async () => {
    const code = mfaDisableCode.trim();

    if (!/^\d{6}$/.test(code)) {
      toast.warning('Enter a 6-digit authenticator code');
      return;
    }

    try {
      await disableMfaMutation.mutateAsync({ code });
      setMfaDisableCode('');
      toast.success('MFA disabled');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  return (
    <ProfileDetailScreen
      title="Security"
      subtitle="Review account protection and local security preferences."
    >
      <SettingsCard
        title="Account protection"
        description="Protect sign-in with email verification and authenticator app codes."
      >
        <InfoRow
          iconName="mark-email-read"
          title="Email verification"
          body="Verified email is required before signing in when Supabase verification is enabled."
        />
        <InfoRow
          iconName="admin-panel-settings"
          title="Multi-factor authentication"
          body={
            mfaEnabled
              ? 'MFA is enabled for this account.'
              : 'Use an authenticator app to protect sign-in with a 6-digit code.'
          }
        />

        {!mfaEnabled && mfaSetup ? (
          <>
            <InfoRow
              iconName="qr-code-2"
              title="Add this account"
              body="Open your authenticator app, approve the LexChain account, then return here and enter the 6-digit code."
            />
            <Button
              label="Open authenticator app"
              fullWidth
              leftIconName="open-in-new"
              disabled={isMfaBusy}
              onPress={handleOpenAuthenticatorApp}
            />
            <ProfileTextField
              label="Manual setup key"
              value={mfaSetup.secret}
              editable={false}
              multiline
              style={profileDetailStyles.mfaReadOnlyInput}
            />
            <ProfileTextField
              label="Authenticator code"
              placeholder="123456"
              value={mfaCode}
              onChangeText={(value) => setMfaCode(value.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />
            <Button
              label="Verify and enable MFA"
              fullWidth
              leftIconName="verified-user"
              loading={enableMfaMutation.isPending}
              disabled={isMfaBusy || mfaCode.trim().length !== 6}
              onPress={handleEnableMfa}
            />
            <Button
              label="Cancel setup"
              variant="secondary"
              fullWidth
              disabled={isMfaBusy}
              onPress={() => {
                setMfaSetup(null);
                setMfaCode('');
              }}
            />
          </>
        ) : null}

        {!mfaEnabled && !mfaSetup ? (
          <Button
            label="Enable MFA"
            variant="secondary"
            fullWidth
            leftIconName="admin-panel-settings"
            loading={setupMfaMutation.isPending}
            disabled={isMfaBusy}
            onPress={handleSetupMfa}
          />
        ) : null}

        {mfaEnabled ? (
          <>
            <ProfileTextField
              label="Disable MFA code"
              placeholder="123456"
              value={mfaDisableCode}
              onChangeText={(value) => setMfaDisableCode(value.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />
            <Button
              label="Disable MFA"
              variant="secondary"
              fullWidth
              leftIconName="lock-open"
              loading={disableMfaMutation.isPending}
              disabled={isMfaBusy || mfaDisableCode.trim().length !== 6}
              onPress={handleDisableMfa}
            />
          </>
        ) : null}

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
