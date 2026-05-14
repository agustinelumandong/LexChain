import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

import { WebsiteLinkButton } from './WebsiteLinkButton';

export function WebHero() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>BLOCKCHAIN-POWERED DOCUMENT VERIFICATION</Text>
        <Text style={styles.title}>
          Verify legal documents{'\n'}with absolute confidence.
        </Text>
        <Text style={styles.subtitle}>
          LexChain combines AI-powered document processing with blockchain anchoring
          to create tamper-proof records that anyone can verify instantly.
        </Text>
        <View style={styles.actions}>
          <WebsiteLinkButton href="/public/verify" label="Verify a Document" />
          <WebsiteLinkButton href="/admin/login" label="Admin Login" variant="secondary" />
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Tamper-proof</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{'<'}3s</Text>
            <Text style={styles.statLabel}>Verification time</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>ECC</Text>
            <Text style={styles.statLabel}>Cryptography</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: APP_COLORS.bg,
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  inner: {
    maxWidth: 780,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 24,
  },
  eyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 48,
    lineHeight: 58,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 600,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingTop: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 32,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: APP_COLORS.borderSoft,
  },
});
