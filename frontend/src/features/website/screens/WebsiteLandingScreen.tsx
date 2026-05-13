import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';

export function WebsiteLandingScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.brand}>LexChain</Text>
          <Text style={styles.title}>
            Verify legal documents with confidence.
          </Text>
          <Text style={styles.subtitle}>
            A public verification portal and secure admin workspace for trusted
            document records.
          </Text>

          <View style={styles.actions}>
            <Link href="/public/verify" asChild>
              <Pressable style={[styles.linkButton, styles.primaryButton]}>
                <Text style={[styles.linkText, styles.primaryText]}>
                  Verify a document
                </Text>
              </Pressable>
            </Link>
            <Link href="/admin/login" asChild>
              <Pressable style={[styles.linkButton, styles.secondaryButton]}>
                <Text style={[styles.linkText, styles.secondaryText]}>
                  Super Admin
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  content: {
    minHeight: '100%',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  hero: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    gap: 18,
  },
  brand: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '900',
    maxWidth: 680,
  },
  subtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    maxWidth: 620,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
  },
  linkButton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: APP_COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: APP_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
  },
  linkText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryText: {
    color: APP_COLORS.white,
  },
  secondaryText: {
    color: APP_COLORS.primary,
  },
});
