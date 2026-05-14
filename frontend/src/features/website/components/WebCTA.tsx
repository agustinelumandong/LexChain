import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

import { WebStoreButtons } from './WebStoreButtons';

export function WebCTA() {
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <Text style={styles.title}>
          Bring legal documents into one secure, searchable, verifiable system.
        </Text>
        <Text style={styles.subtitle}>
          LexChain helps teams retrieve records faster, understand documents easier,
          control access, and verify integrity with confidence.
        </Text>
        <WebStoreButtons />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  card: {
    maxWidth: 1000,
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 56,
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#0985E7',
    // @ts-ignore
    boxShadow: '0 24px 64px rgba(9,133,231,0.25)',
  },
  title: {
    color: '#fff',
    fontFamily: fonts.regular,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '900',
    textAlign: 'center',
    maxWidth: 650,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 560,
  },
});
