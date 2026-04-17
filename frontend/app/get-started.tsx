import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Screen } from '@/shared/components/screen';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';

export default function GetStartedScreen() {
  return (
      <Screen style={styles.container} padded>
      <ThemedView style={styles.content}>
        <ThemedText type="title">LexChain</ThemedText>
        <ThemedText>Secure document verification for your records.</ThemedText>

        <Pressable style={styles.primaryButton} onPress={() => router.push('/login')}>
          <ThemedText style={styles.primaryButtonText}>Get Started</ThemedText>
        </Pressable>

        <Pressable onPress={() => router.push('/register')}>
          <ThemedText type="link">Create an account</ThemedText>
        </Pressable>
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  content: {
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
