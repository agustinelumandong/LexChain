import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

const POINTS = [
  'Verify without exposing private document content on-chain.',
  'Confirm document integrity before sharing or accepting a copy.',
  'Give issuers and authorized users a reliable authenticity check.',
];

export function WebVerificationDemo() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <View style={styles.textCol}>
          <Text style={styles.eyebrow}>DOCUMENT VERIFICATION</Text>
          <Text style={styles.title}>
            Know if a document still matches the original file.
          </Text>
          <Text style={styles.subtitle}>
            LexChain creates a unique file hash and checks it against a blockchain-backed
            record. If a file is changed or tampered with, the hash changes too.
          </Text>
          <View style={styles.points}>
            {POINTS.map((point) => (
              <View key={point} style={styles.pointRow}>
                <MaterialIcons name="check-circle" size={18} color="#0985E7" />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.demoCard}>
          <View style={styles.demoInner}>
            <View style={styles.demoHeader}>
              <View style={styles.demoIcon}>
                <MaterialIcons name="fingerprint" size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.demoLabel}>Integrity Check</Text>
                <Text style={styles.demoStatus}>Match Found</Text>
              </View>
            </View>
            <View style={styles.hashBox}>
              <Text style={styles.hashText}>9f2a7c...e41b2d</Text>
            </View>
            <Text style={styles.demoDesc}>
              This file matches the stored verification record. No change was detected
              from the registered document hash.
            </Text>
          </View>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
    alignItems: 'center',
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
  points: {
    gap: 12,
    paddingTop: 8,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointText: {
    color: '#334155',
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '600',
  },
  demoCard: {
    flex: 1,
    minWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    padding: 24,
    // @ts-ignore
    boxShadow: '0 16px 48px rgba(9,133,231,0.08)',
  },
  demoInner: {
    borderRadius: 16,
    backgroundColor: 'rgba(9,133,231,0.08)',
    padding: 20,
    gap: 16,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0985E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoLabel: {
    color: '#0770c4',
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '700',
  },
  demoStatus: {
    color: '#0f172a',
    fontFamily: fonts.regular,
    fontSize: 22,
    fontWeight: '900',
  },
  hashBox: {
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 14,
  },
  hashText: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '600',
    // @ts-ignore
    fontVariant: ['tabular-nums'],
  },
  demoDesc: {
    color: '#334155',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});
