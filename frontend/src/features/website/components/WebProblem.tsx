import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const PROBLEMS = [
  {
    icon: 'warning' as const,
    title: 'Document Fraud',
    description: 'Forged legal documents cost billions annually and undermine trust in institutions.',
  },
  {
    icon: 'visibility-off' as const,
    title: 'No Transparency',
    description: 'Traditional verification relies on manual checks with no audit trail.',
  },
  {
    icon: 'lock-open' as const,
    title: 'Tampering Risk',
    description: 'Digital documents can be altered without detection after signing.',
  },
];

export function WebProblem() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>THE PROBLEM</Text>
        <Text style={styles.title}>
          Legal documents are vulnerable to fraud and tampering.
        </Text>
        <View style={styles.grid}>
          {PROBLEMS.map((item) => (
            <View key={item.title} style={styles.card}>
              <View style={styles.iconWrap}>
                <MaterialIcons name={item.icon} size={24} color={APP_COLORS.danger} />
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
    maxWidth: 1000,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 32,
  },
  eyebrow: {
    color: APP_COLORS.danger,
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
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 24,
    width: 300,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEEAEA',
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
