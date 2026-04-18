import { Stack } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  surface: '#F3F8FF',
};

type AuthScreenShellProps = {
  children?: React.ReactNode;
  screenOptions?: React.ComponentProps<typeof Stack.Screen>['options'];
};

export function AuthScreenShell({ children, screenOptions }: AuthScreenShellProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false, ...screenOptions }} />
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
