import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { clearSessionData } from '@/features/auth';
import { BottomNav, Button } from '@/ui';

import { ProfileHeader } from '../profile-header';
import { styles } from '../profile-screen.styles';
import {
  getProfileDisplayName,
  getProfileInitials,
  useProfileSettingsStore,
} from '../profile-settings-store';
import { ProfileSummaryCard } from '../profile-summary-card';
import { SettingsListCard } from '../settings-list-card';

export default function ProfileScreen() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const account = useProfileSettingsStore((state) => state.account);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await clearSessionData();
      router.replace('/(auth)/sign-in');
    } catch {
      toast.error('Unable to sign out. Please try again.');
      setIsSigningOut(false);
    }
  };

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
              label={isSigningOut ? 'Signing out...' : 'Sign out'}
              variant="primary"
              fullWidth
              loading={isSigningOut}
              leftIconName="logout"
              onPress={handleSignOut}
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
            showUpload={account.role.toLowerCase() !== 'viewer'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
