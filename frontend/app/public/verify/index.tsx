import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';
import { WebsiteLinkButton } from '@/features/website';

export default function PublicVerifyIndexRoute() {
  const [code, setCode] = useState('LEX-DEMO-2026');
  const trimmedCode = code.trim();
  const verifyHref = trimmedCode
    ? {
        pathname: '/public/verify/[code]' as const,
        params: { code: trimmedCode },
      }
    : '/public/verify';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.brand}>LexChain</Text>
        <Text style={styles.title}>Verify a document</Text>
        <Text style={styles.subtitle}>
          Enter the public verification code shown on the LexChain record.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Verification code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            style={styles.input}
            placeholder="LEX-DEMO-2026"
            placeholderTextColor={APP_COLORS.textMuted}
          />
        </View>

        <WebsiteLinkButton href={verifyHref} label="Verify document" />

        <Link href="/" asChild>
          <Pressable accessibilityRole="link">
            <Text style={styles.homeLink}>Back to website</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.bg,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    padding: 28,
    gap: 18,
  },
  brand: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  field: {
    gap: 8,
  },
  label: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.bg,
    paddingHorizontal: 14,
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '700',
  },
  homeLink: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
