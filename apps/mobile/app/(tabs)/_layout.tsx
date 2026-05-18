import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import * as NavigationBar from "expo-navigation-bar";

import { HapticTab } from '@/shared/components/haptic-tab';
import { IconSymbol, OfflineBanner } from '@/ui';
import { useColorScheme, useNetwork } from '@/hooks';
import { Colors } from '@/theme';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { isOnline } = useNetwork();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle("auto");
    }
  }, []);

  return (
    <>
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
    </>
  );
}
