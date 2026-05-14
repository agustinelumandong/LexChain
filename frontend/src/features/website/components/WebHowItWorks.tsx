import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

const STEPS = [
  { icon: 'cloud-upload' as const, title: 'Upload', copy: 'Authorized users add legal documents and basic details.' },
  { icon: 'search' as const, title: 'Extract', copy: 'OCR reads scanned or digital files and prepares searchable text.' },
  { icon: 'auto-awesome' as const, title: 'Summarize', copy: 'AI highlights parties, dates, obligations, clauses, and risk flags.' },
  { icon: 'shield' as const, title: 'Protect', copy: 'Access rules control who can view, share, search, and verify records.' },
  { icon: 'verified' as const, title: 'Verify', copy: 'A document hash is checked against the blockchain record to detect changes.' },
];

export function WebHowItWorks() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HOW IT WORKS</Text>
          <Text style={styles.title}>
            From upload to verification in one controlled flow.
          </Text>
          <Text style={styles.subtitle}>
            LexChain keeps the experience simple for users while handling the important
            security and search work behind the scenes.
          </Text>
        </View>
        <View style={styles.grid}>
          {STEPS.map((step, index) => (
            <View key={step.title} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  <MaterialIcons name={step.icon} size={20} color="#fff" />
                </View>
                <Text style={styles.stepNum}>0{index + 1}</Text>
              </View>
              <Text style={styles.cardTitle}>{step.title}</Text>
              <Text style={styles.cardCopy}>{step.copy}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#0C2B49',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  inner: {
    maxWidth: 1100,
    alignSelf: 'center',
    gap: 40,
  },
  header: {
    maxWidth: 650,
    gap: 12,
  },
  eyebrow: {
    color: '#8ecbff',
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: '#fff',
    fontFamily: fonts.regular,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '900',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    width: 200,
    flex: 1,
    minWidth: 180,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0985E7',
    alignItems: 'center',
    justifyContent: 'center',
    // @ts-ignore
    boxShadow: '0 6px 16px rgba(9,133,231,0.25)',
  },
  stepNum: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '900',
  },
  cardTitle: {
    color: '#fff',
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '900',
  },
  cardCopy: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
});
