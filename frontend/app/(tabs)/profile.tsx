import React from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getProfileDisplayName,
  getProfileInitials,
  ProfileHeader,
  ProfileMetricsCard,
  ProfileSummaryCard,
  SettingsListCard,
  useProfileSettingsStore,
} from '@/features/profile';
import { BottomNav, Button } from '@/ui';

import { styles } from '@/features/profile/profile-screen.styles';

export default function ProfileScreen() {
  const router = useRouter();
  const account = useProfileSettingsStore((state) => state.account);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader />

          <ProfileSummaryCard
            initials={getProfileInitials(account)}
            name={getProfileDisplayName(account)}
            role={account.role}
            organization={account.organization}
            email={account.email}
          />

          <SettingsListCard
            title="Settings"
            items={[
              {
                label: 'Account details',
                description: 'Update your profile and legal contact info.',
                iconName: 'person-outline',
                onPress: () => router.push('/profile/account'),
              },
              {
                label: 'Notifications',
                description: 'Control alerts for uploads and verifications.',
                iconName: 'notifications-none',
                onPress: () => router.push('/profile/notifications'),
              },
              {
                label: 'Security',
                description: 'Manage password, trusted devices, and sessions.',
                iconName: 'shield',
                onPress: () => router.push('/profile/security'),
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
                onPress: () => router.push('/profile/privacy'),
              },
              {
                label: 'Help and support',
                description: 'Contact support for access or verification issues.',
                iconName: 'help-outline',
                onPress: () => router.push('/profile/support'),
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
    </SafeAreaView>
  );
}
