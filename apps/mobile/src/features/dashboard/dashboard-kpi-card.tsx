import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
import { SkeletonBox } from '@/ui';

const COLORS = {
  surface: APP_COLORS.white,
  iconSurface: '#EEF6FF',
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
};

type DashboardKpiCardProps = {
  label: string;
  value: string;
  iconName: ComponentProps<typeof MaterialIcons>['name'];
};

export function DashboardKpiCard({
  label,
  value,
  iconName,
}: DashboardKpiCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBubble}>
        <MaterialIcons name={iconName} size={16} color={COLORS.primary} />
      </View>

      <View style={styles.copy}>
        <Text
          style={styles.label}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
        >
          {label}
        </Text>
        <Text style={styles.value}>{value}</Text>
      </View>

      <MaterialIcons name="chevron-right" size={14} color="#6B8AB3" />
    </View>
  );
}

export function DashboardKpiSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width={32} height={32} borderRadius={999} />
      <View style={styles.copy}>
        <SkeletonBox width="76%" height={12} borderRadius={999} />
        <SkeletonBox width={32} height={32} borderRadius={18} />
      </View>
      <SkeletonBox width={16} height={16} borderRadius={999} />
    </View>
  );
}

export function DashboardActivitySkeleton() {
  return (
    <View style={styles.activitySkeletonRow}>
      <SkeletonBox width={42} height={42} borderRadius={8} />
      <View style={styles.activitySkeletonCopy}>
        <View style={styles.activitySkeletonTopLine}>
          <SkeletonBox width="58%" height={14} borderRadius={999} />
          <SkeletonBox width={76} height={20} borderRadius={999} />
        </View>
        <SkeletonBox width="78%" height={12} borderRadius={999} />
        <SkeletonBox width="34%" height={12} borderRadius={999} />
      </View>
      <SkeletonBox width={18} height={18} borderRadius={999} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  iconBubble: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.iconSurface,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  value: {
    color: COLORS.navy,
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '900',
    fontFamily: fonts.regular,
    fontVariant: ['tabular-nums'],
  },
  activitySkeletonRow: {
    minHeight: 72,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activitySkeletonCopy: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },
  activitySkeletonTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
