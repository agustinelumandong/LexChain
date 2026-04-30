import { StyleSheet, Text, View } from 'react-native';
import { APP_COLORS, fonts } from '@/theme';
import { SkeletonBox } from '@/ui';

const COLORS = {
  surface: APP_COLORS.white,
  surfaceSuccess: '#EAF8F0',
  surfaceWarning: '#FFF4DD',
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
};

type DashboardKpiCardProps = {
  label: string;
  value: string;
  meta: string;
  tone?: 'positive' | 'warning';
};

export function DashboardKpiCard({
  label,
  value,
  meta,
  tone = 'positive',
}: DashboardKpiCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.metaRow}>
        <View
          style={[
            styles.metaDot,
            tone === 'warning' ? styles.metaDotWarning : styles.metaDotPositive,
          ]}
        />
        <Text style={styles.meta}>{meta}</Text>
      </View>
    </View>
  );
}

export function DashboardKpiSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width="60%" height={14} borderRadius={999} />
      <SkeletonBox width="42%" height={30} borderRadius={999} />
      <View style={styles.metaRow}>
        <SkeletonBox width={10} height={10} borderRadius={999} />
        <SkeletonBox width="70%" height={14} borderRadius={999} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    gap: 8,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  value: {
    color: COLORS.navy,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  metaDotPositive: {
    backgroundColor: COLORS.surfaceSuccess,
  },
  metaDotWarning: {
    backgroundColor: COLORS.surfaceWarning,
  },
  meta: {
    color: COLORS.primary,
    flex: 1,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
});
