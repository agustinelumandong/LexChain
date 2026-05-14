import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

export function WebAskDemo() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <View style={styles.demoCard}>
          <View style={styles.questionBox}>
            <MaterialIcons name="search" size={18} color="#0985E7" />
            <Text style={styles.questionText}>
              What are the payment obligations in this contract?
            </Text>
          </View>
          <View style={styles.answerBox}>
            <Text style={styles.answerLabel}>LexChain Answer</Text>
            <Text style={styles.answerText}>
              The contract requires monthly payment every 15th day of the month,
              submission of proof of payment, and a late fee if payment is not
              completed within the grace period.
            </Text>
          </View>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.eyebrow}>SEARCH & ASK-DOCUMENT</Text>
          <Text style={styles.title}>
            Ask questions across documents you are allowed to access.
          </Text>
          <Text style={styles.subtitle}>
            Instead of manually opening every PDF, users can search document content
            or ask focused questions. LexChain answers from authorized records only,
            keeping retrieval fast and controlled.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#F8FBFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  inner: {
    maxWidth: 1100,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
    alignItems: 'center',
  },
  demoCard: {
    flex: 1,
    minWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    padding: 24,
    gap: 20,
    // @ts-ignore
    boxShadow: '0 16px 48px rgba(9,133,231,0.08)',
  },
  questionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: '#F8FBFF',
    padding: 16,
  },
  questionText: {
    flex: 1,
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '600',
  },
  answerBox: {
    borderRadius: 14,
    backgroundColor: '#0985E7',
    padding: 20,
    gap: 8,
  },
  answerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '700',
  },
  answerText: {
    color: '#fff',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  textCol: {
    flex: 1,
    minWidth: 300,
    gap: 16,
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
  },
  subtitle: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
  },
});
