import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const FEATURES = [
  {
    icon: 'document-scanner' as const,
    title: 'AI-Powered OCR & NLP',
    description: 'Automatically extract text, entities, and summaries from uploaded legal documents.',
  },
  {
    icon: 'link' as const,
    title: 'Blockchain Anchoring',
    description: 'Every document hash is anchored on-chain, creating an immutable proof of existence.',
  },
  {
    icon: 'verified' as const,
    title: 'Instant Verification',
    description: 'Anyone with a verification code can confirm document authenticity in seconds.',
  },
  {
    icon: 'admin-panel-settings' as const,
    title: 'Access Control',
    description: 'Whitelist-based permissions let you control who can view, verify, or download.',
  },
  {
    icon: 'history' as const,
    title: 'Version History',
    description: 'Track every revision with full audit trail and blockchain-backed integrity.',
  },
  {
    icon: 'question-answer' as const,
    title: 'Ask Your Document',
    description: 'AI-powered Q&A lets you query document contents in natural language.',
  },
];

export function WebFeatures() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>FEATURES</Text>
        <Text style={styles.title}>
          Everything you need for trusted document management.
        </Text>
        <View style={styles.grid}>
          {FEATURES.map((item) => (
            <View key={item.title} style={styles.card}>
              <View style={styles.iconWrap}>
                <MaterialIcons name={item.icon} size={22} color={APP_COLORS.primary} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
          ))}
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
    maxWidth: 1100,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 32,
  },
  eyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'center',
    maxWidth: 600,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    paddingTop: 16,
  },
  card: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    padding: 24,
    width: 330,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 17,
    fontWeight: '800',
  },
  cardDesc: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});
