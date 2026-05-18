import { Pressable, Text, View } from 'react-native';

import { dashboardRecentListStyles } from './dashboard-recent-list.styles';
import type { DashboardRecentBadgeTone } from './dashboard-recent-list.utils';

type DashboardRecentRowProps = {
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeTone: DashboardRecentBadgeTone;
  onPress?: () => void;
};

export function DashboardRecentRow({
  title,
  subtitle,
  badgeLabel,
  badgeTone,
  onPress,
}: DashboardRecentRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        dashboardRecentListStyles.row,
        pressed && dashboardRecentListStyles.rowPressed,
      ]}
      onPress={onPress}
    >
      <View style={dashboardRecentListStyles.copy}>
        <Text style={dashboardRecentListStyles.title} numberOfLines={1}>{title}</Text>
        <Text style={dashboardRecentListStyles.subtitle}>{subtitle}</Text>
      </View>

      <View style={[dashboardRecentListStyles.badge, getBadgeStyle(badgeTone)]}>
        <Text style={[dashboardRecentListStyles.badgeLabel, getBadgeLabelStyle(badgeTone)]}>
          {badgeLabel}
        </Text>
      </View>
    </Pressable>
  );
}

function getBadgeStyle(badgeTone: DashboardRecentBadgeTone) {
  if (badgeTone === 'success') {
    return dashboardRecentListStyles.badgeSuccess;
  }
  if (badgeTone === 'error') {
    return dashboardRecentListStyles.badgeError;
  }
  return dashboardRecentListStyles.badgeWarning;
}

function getBadgeLabelStyle(badgeTone: DashboardRecentBadgeTone) {
  if (badgeTone === 'success') {
    return dashboardRecentListStyles.badgeLabelSuccess;
  }
  if (badgeTone === 'error') {
    return dashboardRecentListStyles.badgeLabelError;
  }
  return dashboardRecentListStyles.badgeLabelWarning;
}
