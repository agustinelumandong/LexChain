import React from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileHeader } from '@/features/profile/profile-header';
import { ProfileMetricsCard } from '@/features/profile/profile-metrics-card';
import { ProfileSummaryCard } from '@/features/profile/profile-summary-card';
import { SettingsListCard } from '@/features/profile/settings-list-card';
import { BottomNav } from '@/shared/components/ui/bottom-nav';
import { Button } from '@/shared/components/ui/button';

const COLORS = {
  bg: '#F3F8FF',
  surface: '#FFFFFF',
};

export default function ProfileScreen() {
  const router = useRouter();

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
                onPress: () => {},
              },
              {
                label: 'Notifications',
                description: 'Control alerts for uploads and verifications.',
                iconName: 'notifications-none',
                onPress: () => {},
              },
              {
                label: 'Security',
                description: 'Manage password, trusted devices, and sessions.',
                iconName: 'shield',
                onPress: () => {},
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
                onPress: () => {},
              },
              {
                label: 'Help and support',
                description: 'Contact support for access or verification issues.',
                iconName: 'help-outline',
                onPress: () => {},
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
