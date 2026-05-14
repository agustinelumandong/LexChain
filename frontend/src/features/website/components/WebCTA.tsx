import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

import { WebsiteLinkButton } from './WebsiteLinkButton';

export function WebCTA() {
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <Text style={styles.title}>Ready to verify documents?</Text>
        <Text style={styles.subtitle}>
          Start verifying legal documents instantly with our public verification portal,
          or sign in to manage your own documents securely.
        </Text>
        <View style={styles.actions}>
          <WebsiteLinkButton href="/public/verify" label="Public Verifier" />
          <WebsiteLinkButton href="/admin/login" label="Admin Panel" variant="secondary" />
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
  card: {
    maxWidth: 800,
    alignSelf: 'center',
    backgroundColor: APP_COLORS.navy,
    borderRadius: 24,
    padding: 56,
    alignItems: 'center',
    gap: 20,
  },
  title: {
    color: APP_COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#A8C4E0',
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 540,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingTop: 12,
  },
});
