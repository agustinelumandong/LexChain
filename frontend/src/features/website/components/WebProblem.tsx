import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const PROBLEMS = [
  {
    icon: 'folder' as const,
    title: 'Scattered Storage',
    description: 'Legal files are still kept in paper folders, manual logbooks, email threads, and disconnected drives.',
  },
  {
    icon: 'search-off' as const,
    title: 'Hard to Find',
    description: 'Finding the correct document takes time because records are named, tagged, or stored inconsistently.',
  },
  {
    icon: 'visibility-off' as const,
    title: 'No Integrity Check',
    description: 'Teams cannot easily know if a scanned copy is the same file that was originally issued.',
  },
  {
    icon: 'lock-open' as const,
    title: 'Uncontrolled Access',
    description: 'Sensitive documents are shared without clear visibility into who should access them.',
  },
];

export function WebProblem() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>THE PROBLEM</Text>
        <Text style={styles.title}>
          Legal documents are hard to find, easy to lose, and difficult to verify.
        </Text>
        <Text style={styles.subtitle}>
          Many teams still rely on paper folders, manual logbooks, shared drives, or scattered
          digital copies. That makes important records hard to retrieve, easy to lose, and
          difficult to trust when authenticity matters.
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
    gap: 24,
  },
  eyebrow: {
    color: APP_COLORS.danger,
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
    maxWidth: 650,
  },
  subtitle: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 620,
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
    width: 460,
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
    color: '#0f172a',
    fontFamily: fonts.regular,
    fontSize: 17,
    fontWeight: '800',
  },
  cardDesc: {
    color: '#64748b',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});
