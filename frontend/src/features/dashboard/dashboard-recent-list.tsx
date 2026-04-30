import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
import type { MockDocument } from '@/types';

const COLORS = {
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  surfaceSuccess: '#EAF8F0',
  surfaceWarning: '#FFF4DD',
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  warning: '#D28B00',
};

type DashboardRecentListProps = {
  documents: MockDocument[];
  onPressDocument: () => void;
};

export function DashboardRecentList({
  documents,
  onPressDocument,
}: DashboardRecentListProps) {
  return (
    <View style={styles.group}>
 <Text style={styles.heading}>Recent documents</Text>
      {documents.length > 0 ? (
        documents.map((document) => (
          <DocumentRow
            key={document.id}
            title={document.title}
            subtitle={document.status === 'verified' ? 'Summary ready' : 'Integrity warning'}
            badgeLabel={document.status === 'verified' ? 'MATCH' : 'REVIEW'}
            badgeTone={document.status === 'verified' ? 'match' : 'review'}
            onPress={onPressDocument}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No documents yet</Text>
          <Text style={styles.emptyBody}>
            Upload your first document to start building your repository.
          </Text>
        </View>
      )}
    </View>
  );
}

type DocumentRowProps = {
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeTone: 'match' | 'review';
  onPress?: () => void;
};

function DocumentRow({
  title,
  subtitle,
  badgeLabel,
  badgeTone,
  onPress,
}: DocumentRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View
        style={[
          styles.badge,
          badgeTone === 'match' ? styles.badgeMatch : styles.badgeReview,
        ]}
      >
        <Text
          style={[
            styles.badgeLabel,
            badgeTone === 'match' ? styles.badgeLabelMatch : styles.badgeLabelReview,
          ]}
        >
          {badgeLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 12,
  },
  heading: {
    color: COLORS.navy,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  row: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceSoft,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMatch: {
    backgroundColor: COLORS.surfaceSuccess,
  },
  badgeReview: {
    backgroundColor: COLORS.surfaceWarning,
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  badgeLabelMatch: {
    color: COLORS.primary,
  },
  badgeLabelReview: {
    color: COLORS.warning,
  },
  emptyState: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSoft,
    gap: 6,
  },
  emptyTitle: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  emptyBody: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
});
