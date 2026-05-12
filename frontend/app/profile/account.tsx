import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import {
  ProfileDetailScreen,
  ProfileTextField,
  SettingsCard,
  type ProfileAccount,
  useProfileSettingsStore,
} from '@/features/profile';
import { Button } from '@/ui';

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
      organization: draft.organization.trim(),
      role: draft.role.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
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
        <View style={{ gap: 12 }}>
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
            label="Organization"
            value={draft.organization}
            onChangeText={(value) => updateDraft('organization', value)}
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
        description="Contact fields stay local until backend profile persistence is available."
      >
        <View style={{ gap: 12 }}>
          <ProfileTextField
            label="Email"
            value={draft.email}
            onChangeText={(value) => updateDraft('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <ProfileTextField
            label="Phone"
            value={draft.phone}
            onChangeText={(value) => updateDraft('phone', value)}
            keyboardType="phone-pad"
          />
        </View>
      </SettingsCard>
    </ProfileDetailScreen>
  );
}
