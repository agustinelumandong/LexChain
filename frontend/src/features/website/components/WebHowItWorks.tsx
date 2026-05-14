import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const STEPS = [
  {
    step: '01',
    icon: 'cloud-upload' as const,
    title: 'Upload Document',
    description: 'Upload a PDF or capture with your camera. Our system accepts any legal document format.',
  },
  {
    step: '02',
    icon: 'psychology' as const,
    title: 'AI Processing',
    description: 'OCR extracts text, NLP generates summaries, entities, and risk flags automatically.',
  },
  {
    step: '03',
    icon: 'account-tree' as const,
    title: 'Blockchain Anchoring',
    description: 'A cryptographic hash of your document is anchored on-chain for tamper-proof integrity.',
  },
  {
    step: '04',
    icon: 'verified-user' as const,
    title: 'Verify Anytime',
    description: 'Share a verification code. Anyone can confirm authenticity against the blockchain record.',
  },
];

export function WebHowItWorks() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>HOW IT WORKS</Text>
        <Text style={styles.title}>
          From upload to verification in four simple steps.
        </Text>
        <View style={styles.grid}>
          {STEPS.map((item, index) => (
            <View key={item.step} style={styles.card}>
              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>{item.step}</Text>
                {index < STEPS.length - 1 && <View style={styles.connector} />}
              </View>
              <View style={styles.iconWrap}>
                <MaterialIcons name={item.icon} size={28} color={APP_COLORS.primary} />
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
    backgroundColor: APP_COLORS.white,
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
    gap: 24,
    justifyContent: 'center',
    paddingTop: 16,
  },
  card: {
    backgroundColor: APP_COLORS.bg,
    borderRadius: 16,
    padding: 28,
    width: 250,
    gap: 14,
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '900',
  },
  connector: {
    width: 0,
    height: 0,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardDesc: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});
