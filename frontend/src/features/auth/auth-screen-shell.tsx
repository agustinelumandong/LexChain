import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { APP_COLORS } from '@/theme';
const COLORS = {
  surface: APP_COLORS.bg,
};

type AuthScreenShellProps = {
  children?: React.ReactNode;
};

export function AuthScreenShell({ children }: AuthScreenShellProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});
