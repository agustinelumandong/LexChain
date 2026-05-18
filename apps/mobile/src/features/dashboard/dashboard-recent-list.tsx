import { Text, View } from 'react-native';

import type { DocumentListItem } from '@/services/api';
import { SkeletonBox } from '@/ui';

import { DashboardRecentEmptyState } from './dashboard-recent-empty-state';
import { DashboardRecentRow } from './dashboard-recent-row';
import {
  formatDashboardRecentDate,
  getDashboardRecentBadgeTone,
} from './dashboard-recent-list.utils';
import { dashboardRecentListStyles } from './dashboard-recent-list.styles';

type DashboardRecentListProps = {
  documents: DocumentListItem[];
  onPressDocument: (documentId: string) => void;
};

export function DashboardRecentList({
  documents,
  onPressDocument,
}: DashboardRecentListProps) {
  return (
    <View style={dashboardRecentListStyles.group}>
      <Text style={dashboardRecentListStyles.heading}>Recent documents</Text>
      {documents.length > 0 ? (
        documents.map((document) => (
          <DashboardRecentRow
            key={document.id}
            title={document.file_name.length > 30 ? `${document.file_name.slice(0, 30)}...` : document.file_name}
            subtitle={formatDashboardRecentDate(document.created_at)}
            badgeLabel={document.status}
            badgeTone={getDashboardRecentBadgeTone(document.status)}
            onPress={() => onPressDocument(document.id)}
          />
        ))
      ) : (
        <DashboardRecentEmptyState />
      )}
    </View>
  );
}

export function DashboardRecentListSkeleton() {
  return (
    <View style={dashboardRecentListStyles.group}>
      <SkeletonBox width={148} height={20} borderRadius={999} />
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={dashboardRecentListStyles.row}>
          <View style={dashboardRecentListStyles.copy}>
            <SkeletonBox width="72%" height={14} borderRadius={999} />
            <SkeletonBox width="38%" height={12} borderRadius={999} />
          </View>

          <SkeletonBox width={84} height={28} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}
