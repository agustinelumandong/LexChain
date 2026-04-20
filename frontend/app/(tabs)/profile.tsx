import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileHeader } from '@/features/profile/profile-header';
import { ProfileMetricsCard } from '@/features/profile/profile-metrics-card';
import {
  SettingsInfoModal,
  type SettingsInfoModalData,
} from '@/features/profile/settings-info-modal';
import { ProfileSummaryCard } from '@/features/profile/profile-summary-card';
import { SettingsListCard } from '@/features/profile/settings-list-card';
import { BottomNav } from '@/shared/components/ui/bottom-nav';
import { Button } from '@/shared/components/ui/button';

const COLORS = {
  bg: '#F3F8FF',
  surface: '#FFFFFF',
};

const SETTINGS_DETAILS: Record<string, SettingsInfoModalData> = {
  account: {
    title: 'Account details',
    description: 'Profile details help identify who uploaded, verified, and shared each document.',
    bullets: [
      'Update your display name and legal contact information.',
      'Keep your organization details accurate for repository records.',
      'Use this area later for profile editing once account persistence is connected.',
    ],
  },
  notifications: {
    title: 'Notifications',
    description: 'Notification preferences control when LexChain alerts you about important document activity.',
    bullets: [
      'Get alerts when uploads finish processing.',
      'Get review reminders when a document needs attention.',
      'Add fine-grained email and in-app toggles later with backend support.',
    ],
  },
  security: {
    title: 'Security',
    description: 'Security settings will hold the controls that protect your account and trusted sessions.',
    bullets: [
      'Change password and review sign-in protection.',
      'Manage trusted devices and active sessions.',
      'Add stronger account recovery and verification options later.',
    ],
  },
  privacy: {
    title: 'Privacy policy',
    description: 'Privacy guidance explains how account and document data is handled inside LexChain.',
    bullets: [
      'Review how uploaded files and summaries are processed.',
      'Understand how whitelist access affects visibility.',
      'Link this modal to a full legal policy page when policy copy is finalized.',
    ],
  },
  support: {
    title: 'Help and support',
    description: 'Support options will help users recover access and troubleshoot verification issues.',
    bullets: [
      'Use support for upload, access, or verification issues.',
      'Add help center links and support contact actions later.',
      'This is the place for FAQs, troubleshooting, and escalation info.',
    ],
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const [selectedSettingsKey, setSelectedSettingsKey] = useState<keyof typeof SETTINGS_DETAILS | null>(
    null,
  );

  const selectedSettingsData = useMemo(
    () => (selectedSettingsKey ? SETTINGS_DETAILS[selectedSettingsKey] : null),
    [selectedSettingsKey],
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader />

          <ProfileSummaryCard
            initials="CS"
            name="Carl Shan"
            role="Authorized user"
            organization="LexChain Legal Office"
            email="carl.shan@lexchain.app"
          />

          <ProfileMetricsCard
            metrics={[
              { label: 'Documents', value: '124' },
              { label: 'Active grants', value: '53' },
              { label: 'Verified rate', value: '98%' },
            ]}
          />

          <SettingsListCard
            title="Settings"
            items={[
              {
                label: 'Account details',
                description: 'Update your profile and legal contact info.',
                iconName: 'person-outline',
                onPress: () => setSelectedSettingsKey('account'),
              },
              {
                label: 'Notifications',
                description: 'Control alerts for uploads and verifications.',
                iconName: 'notifications-none',
                onPress: () => setSelectedSettingsKey('notifications'),
              },
              {
                label: 'Security',
                description: 'Manage password, trusted devices, and sessions.',
                iconName: 'shield',
                onPress: () => setSelectedSettingsKey('security'),
              },
            ]}
          />

          <SettingsListCard
            title="Support"
            items={[
              {
                label: 'Privacy policy',
                description: 'Review how document and account data is handled.',
                iconName: 'policy',
                onPress: () => setSelectedSettingsKey('privacy'),
              },
              {
                label: 'Help and support',
                description: 'Contact support for access or verification issues.',
                iconName: 'help-outline',
                onPress: () => setSelectedSettingsKey('support'),
              },
            ]}
          />

          <View style={styles.sessionCard}>
            <Button
              label="Sign out"
              variant="primary"
              fullWidth
              leftIconName="logout"
              onPress={() => router.replace('/(auth)/sign-in')}
            />
          </View>
        </ScrollView>

        <View style={styles.navWrap}>
          <BottomNav
            activeTab="profile"
            onPressHome={() => router.push('/(tabs)')}
            onPressDocuments={() => router.push('/(tabs)/documents')}
            onPressProfile={() => {}}
            onPressUpload={() => router.push('/upload')}
          />
        </View>
      </View>

      <SettingsInfoModal
        visible={selectedSettingsData !== null}
        data={selectedSettingsData}
        onClose={() => setSelectedSettingsKey(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  sessionCard: {
    borderRadius: 24,
  },
  navWrap: {
    width: '100%',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});
