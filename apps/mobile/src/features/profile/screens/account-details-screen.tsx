import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import { Button } from '@/ui';

import { ProfileDetailScreen } from '../profile-detail-screen';
import { profileDetailStyles } from '../profile-detail.styles';
import { ProfileTextField } from '../profile-text-field';
import {
  type ProfileAccount,
  useProfileSettingsStore,
} from '../profile-settings-store';
import { SettingsCard } from '../settings-card';

export default function AccountDetailsScreen() {
  const account = useProfileSettingsStore((state) => state.account);
  const updateAccount = useProfileSettingsStore((state) => state.updateAccount);
  const [draft, setDraft] = useState<ProfileAccount>(account);

  useEffect(() => {
    setDraft(account);
  }, [account]);

  const updateDraft = (key: keyof ProfileAccount, value: string) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = () => {
    updateAccount({
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      role: draft.role.trim(),
      email: draft.email.trim(),
    });
    toast.success('Account details saved');
  };

  return (
    <ProfileDetailScreen
      title="Account details"
      subtitle="Update the profile identity shown across LexChain records."
      footer={<Button label="Save changes" fullWidth onPress={handleSave} />}
    >
      <SettingsCard
        title="Legal profile"
        description="These local details identify who uploaded, verified, and shared documents."
      >
        <View style={profileDetailStyles.fieldStack}>
          <ProfileTextField
            label="First name"
            value={draft.firstName}
            onChangeText={(value) => updateDraft('firstName', value)}
            autoCapitalize="words"
          />
          <ProfileTextField
            label="Last name"
            value={draft.lastName}
            onChangeText={(value) => updateDraft('lastName', value)}
            autoCapitalize="words"
          />
          <ProfileTextField
            label="Role / title"
            value={draft.role}
            onChangeText={(value) => updateDraft('role', value)}
            autoCapitalize="words"
          />
        </View>
      </SettingsCard>

      <SettingsCard
        title="Contact"
        description="Email stays local until backend profile persistence is available."
      >
        <View style={profileDetailStyles.fieldStack}>
          <ProfileTextField
            label="Email"
            value={draft.email}
            onChangeText={(value) => updateDraft('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </SettingsCard>
    </ProfileDetailScreen>
  );
}
