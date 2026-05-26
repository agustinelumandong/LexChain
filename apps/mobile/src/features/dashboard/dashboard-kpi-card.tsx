import { MaterialIcons } from '@expo/vector-icons';
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
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>

      <MaterialIcons name="chevron-right" size={16} color="#6B8AB3" />
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  iconBubble: {
    width: 32,
    height: 32,
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
});
