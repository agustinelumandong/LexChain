import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

const FEATURES = [
  { icon: 'lock' as const, title: 'Secure Upload & Storage', copy: 'Manage legal documents with ownership, access rules, and organized metadata.' },
  { icon: 'document-scanner' as const, title: 'AI-Powered OCR & NLP', copy: 'Convert scanned documents into readable, searchable content automatically.' },
  { icon: 'auto-awesome' as const, title: 'AI Document Summaries', copy: 'Get short explanations that help users understand long legal files faster.' },
  { icon: 'fact-check' as const, title: 'Key Information Detection', copy: 'Identify parties, dates, obligations, clauses, categories, and risk indicators.' },
  { icon: 'question-answer' as const, title: 'Ask-Document Search', copy: 'Ask questions about authorized documents and receive focused answers from content.' },
  { icon: 'fingerprint' as const, title: 'Blockchain Verification', copy: 'Confirm document integrity without exposing private document content on-chain.' },
];

export function WebFeatures() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>MAIN FEATURES</Text>
        <Text style={styles.title}>Built for faster legal document work.</Text>
        <Text style={styles.subtitle}>
          The system focuses on real daily value: quick retrieval, clearer document
          understanding, controlled sharing, and reliable integrity checks.
        </Text>
        <View style={styles.grid}>
          {FEATURES.map((item) => (
            <View key={item.title} style={styles.card}>
              <View style={styles.iconWrap}>
                <MaterialIcons name={item.icon} size={22} color="#0985E7" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardCopy}>{item.copy}</Text>
            </View>
          ))}
        </View>
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
  inner: {
    maxWidth: 1100,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 20,
  },
  eyebrow: {
    color: '#0985E7',
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: '#0f172a',
    fontFamily: fonts.regular,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 600,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    width: 330,
    gap: 12,
    // @ts-ignore
    boxShadow: '0 1px 3px rgba(9,133,231,0.03)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(9,133,231,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#0f172a',
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '900',
  },
  cardCopy: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});
