import { Text, View } from 'react-native';

import { SkeletonBox } from '@/ui';

import { ProfileSummaryInfoRow } from './profile-summary-info-row';
import { profileSummaryCardStyles } from './profile-summary-card.styles';
import { ProfileSummaryStatusChip } from './profile-summary-status-chip';

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
    <View style={profileSummaryCardStyles.card}>
      <View style={profileSummaryCardStyles.topRow}>
        <View style={profileSummaryCardStyles.avatar}>
          <Text style={profileSummaryCardStyles.avatarLabel}>{initials}</Text>
        </View>

        <View style={profileSummaryCardStyles.copy}>
          <Text style={profileSummaryCardStyles.name}>{name}</Text>
          <Text style={profileSummaryCardStyles.role}>{role}</Text>
        </View>
      </View>

      <ProfileSummaryInfoRow iconName="business" value={organization} />

      <ProfileSummaryInfoRow iconName="mail-outline" value={email} />

      <ProfileSummaryStatusChip />
    </View>
  );
}

export function ProfileSummarySkeleton() {
  return (
    <View style={profileSummaryCardStyles.card}>
      <View style={profileSummaryCardStyles.topRow}>
        <SkeletonBox width={60} height={60} borderRadius={18} />

        <View style={profileSummaryCardStyles.copy}>
          <SkeletonBox width="55%" height={20} borderRadius={999} />
          <SkeletonBox width="42%" height={14} borderRadius={999} />
        </View>
      </View>

      <View style={profileSummaryCardStyles.infoRow}>
        <SkeletonBox width={16} height={16} borderRadius={999} />
        <SkeletonBox width="70%" height={14} borderRadius={999} />
      </View>

      <View style={profileSummaryCardStyles.infoRow}>
        <SkeletonBox width={16} height={16} borderRadius={999} />
        <SkeletonBox width="62%" height={14} borderRadius={999} />
      </View>

      <SkeletonBox width={120} height={32} borderRadius={999} />
    </View>
  );
}
