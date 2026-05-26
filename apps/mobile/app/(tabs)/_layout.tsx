import { Tabs, usePathname, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import * as NavigationBar from "expo-navigation-bar";

import { HapticTab } from '@/shared/components/haptic-tab';
import { BottomNav, IconSymbol, OfflineBanner } from '@/ui';
import { useColorScheme, useNetwork } from '@/hooks';
import { Colors } from '@/theme';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { canRoleUploadDocuments } from '@/features/profile';
import { useUserProfile } from '@/services/query';

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isOnline } = useNetwork();
  const userProfileQuery = useUserProfile();
  const canUpload = canRoleUploadDocuments(userProfileQuery.data?.role);
  const activeTab = pathname.includes('/documents')
    ? 'documents'
    : pathname.includes('/profile')
      ? 'profile'
      : 'home';

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle("auto");
    }
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {!isOnline ? <OfflineBanner /> : null}
      <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarStyle: { display: 'none' },
          }}
        >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="documents"
          options={{
            title: 'Documents',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle.fill" color={color} />,
            headerShown: false,
          }}
        />
        </Tabs>
      <LinearGradient
        colors={[
          'rgba(243, 248, 255, 0)',
          'rgba(215, 235, 255, 0.9)',
        ]}
        pointerEvents="box-none"
        style={styles.footer}
      >
        <BottomNav
          activeTab={activeTab}
          onPressHome={() => {
            if (activeTab !== 'home') {
              router.push('/(tabs)');
            }
          }}
          onPressDocuments={() => {
            if (activeTab !== 'documents') {
              router.push('/(tabs)/documents');
            }
          }}
          onPressProfile={() => {
            if (activeTab !== 'profile') {
              router.push('/(tabs)/profile');
            }
          }}
          onPressUpload={() => router.push('/upload')}
          showUpload={canUpload}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 24,
  },
});
