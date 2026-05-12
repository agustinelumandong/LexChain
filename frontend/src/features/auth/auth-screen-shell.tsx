import React from 'react';
import { KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native';
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
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});
