import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
import type { DocumentListItem } from '@/services/api';

const COLORS = {
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  surfaceSuccess: '#EAF8F0',
  surfaceWarning: '#FFF4DD',
  surfaceError: '#FEE2E2',
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  warning: '#D28B00',
  success: '#16A34A',
  error: '#DC2626',
};

type DashboardRecentListProps = {
  documents: DocumentListItem[];
  onPressDocument: (documentId: string) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

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
            title={document.file_name.length > 30 ? `${document.file_name.slice(0, 30)}...` : document.file_name}
            subtitle={formatDate(document.created_at)}
            badgeLabel={document.status}
            badgeTone={getBadgeTone(document.status)}
            onPress={() => onPressDocument(document.id)}
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

type BadgeTone = 'success' | 'warning' | 'error';

function getBadgeTone(status: string): BadgeTone {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus.includes('verified') || normalizedStatus.includes('complete') || normalizedStatus.includes('success')) {
    return 'success';
  }
  if (normalizedStatus.includes('failed') || normalizedStatus.includes('error')) {
    return 'error';
  }
  return 'warning';
}

type DocumentRowProps = {
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeTone: BadgeTone;
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
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View
        style={[
          styles.badge,
          badgeTone === 'success' && styles.badgeSuccess,
          badgeTone === 'warning' && styles.badgeWarning,
          badgeTone === 'error' && styles.badgeError,
        ]}
      >
        <Text
          style={[
            styles.badgeLabel,
            badgeTone === 'success' && styles.badgeLabelSuccess,
            badgeTone === 'warning' && styles.badgeLabelWarning,
            badgeTone === 'error' && styles.badgeLabelError,
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
  rowPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
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
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeSuccess: {
    backgroundColor: COLORS.surfaceSuccess,
  },
  badgeWarning: {
    backgroundColor: COLORS.surfaceWarning,
  },
  badgeError: {
    backgroundColor: COLORS.surfaceError,
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    fontFamily: fonts.regular,
    textTransform: 'capitalize',
  },
  badgeLabelSuccess: {
    color: COLORS.success,
  },
  badgeLabelWarning: {
    color: COLORS.warning,
  },
  badgeLabelError: {
    color: COLORS.error,
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
