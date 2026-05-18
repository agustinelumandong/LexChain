import { Text, View } from 'react-native';

import { dashboardRecentListStyles } from './dashboard-recent-list.styles';

export function DashboardRecentEmptyState() {
  return (
    <View style={dashboardRecentListStyles.emptyState}>
      <Text style={dashboardRecentListStyles.emptyTitle}>No documents yet</Text>
      <Text style={dashboardRecentListStyles.emptyBody}>
        Upload your first document to start building your repository.
      </Text>
    </View>
  );
}
