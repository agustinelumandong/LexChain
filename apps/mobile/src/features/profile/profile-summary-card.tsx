import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
import { SkeletonBox } from '@/ui';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  borderSoft: APP_COLORS.borderSoft,
};

type ProfileSummaryCardProps = {
  initials: string;
  name: string;
  role: string;
  organization: string;
  email: string;
};

export function ProfileSummaryCard({
  initials,
  name,
  role,
  organization,
  email,
}: ProfileSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{initials}</Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="business" size={16} color={COLORS.textMuted} />
        <Text style={styles.infoText}>{organization}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="mail-outline" size={16} color={COLORS.textMuted} />
        <Text style={styles.infoText}>{email}</Text>
      </View>

      <View style={styles.statusChip}>
        <Text style={styles.statusChipText}>Verified member</Text>
      </View>
    </View>
  );
}

export function ProfileSummarySkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <SkeletonBox width={60} height={60} borderRadius={18} />

        <View style={styles.copy}>
          <SkeletonBox width="55%" height={20} borderRadius={999} />
          <SkeletonBox width="42%" height={14} borderRadius={999} />
        </View>
      </View>

      <View style={styles.infoRow}>
        <SkeletonBox width={16} height={16} borderRadius={999} />
        <SkeletonBox width="70%" height={14} borderRadius={999} />
      </View>

      <View style={styles.infoRow}>
        <SkeletonBox width={16} height={16} borderRadius={999} />
        <SkeletonBox width="62%" height={14} borderRadius={999} />
      </View>

      <SkeletonBox width={120} height={32} borderRadius={999} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: COLORS.primary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: COLORS.navy,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  role: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: COLORS.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  statusChipText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
});
