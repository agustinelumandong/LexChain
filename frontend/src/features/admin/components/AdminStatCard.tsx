import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

type AdminStatCardProps = {
  label: string;
  value: number | string;
  detail?: string;
};

export function AdminStatCard({ label, value, detail }: AdminStatCardProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <View style={styles.card}>
      <Text style={styles.value}>{displayValue}</Text>
      <Text style={styles.label}>{label}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 180,
    borderRadius: 18,
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    padding: 18,
    gap: 8,
  },
  value: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  label: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  detail: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
