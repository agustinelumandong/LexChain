import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import type { AuditLogResponse } from '@/services/api';
import { APP_COLORS } from '@/theme';
import {
  formatAuditAction,
  formatAuditDetails,
  formatAuditTime,
  formatIdOrHash,
  sortAuditLogsNewestFirst,
} from '@/features/document/utils/audit-log-formatters';

import { documentDetailCardStyles as styles } from './document-detail-card.styles';

type AuditTrailCardProps = {
  logs: AuditLogResponse[];
  onPressViewAll?: () => void;
  showAll?: boolean;
};

export function AuditTrailCard({
  logs,
  onPressViewAll,
  showAll = false,
}: AuditTrailCardProps) {
  const sortedLogs = sortAuditLogsNewestFirst(logs);
  const visibleLogs = showAll ? sortedLogs : sortedLogs.slice(0, 3);

  return (
    <View style={styles.versionCard}>
      <View style={styles.versionHeader}>
        <View style={styles.versionHeaderCopy}>
          <View style={styles.cardIconBubble}>
            <MaterialIcons name="fact-check" size={22} color={APP_COLORS.primary} />
          </View>
          <Text style={styles.versionTitle}>Audit trail</Text>
        </View>
        {!showAll && onPressViewAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View full audit trail"
            onPress={onPressViewAll}
            style={({ pressed }) => [
              styles.headerAction,
              pressed && styles.headerActionPressed,
            ]}
          >
            <Text style={styles.headerActionText}>View all</Text>
          </Pressable>
        ) : null}
      </View>

      {visibleLogs.length === 0 ? (
        <Text style={styles.emptyTimelineText}>No audit events yet</Text>
      ) : (
        <View style={styles.timeline}>
          {visibleLogs.map((log, index) => {
            const isLast = index === visibleLogs.length - 1;
            const detailsText = formatAuditDetails(log.details);

            return (
              <View key={log.id} style={styles.timelineRow}>
                <View style={styles.timelineDateColumn}>
                  <Text style={styles.timelineDate}>
                    {formatAuditTime(log.created_at)}
                  </Text>
                </View>

                <View style={styles.timelineLineColumn}>
                  <View style={styles.timelineDot} />
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>
                    {formatAuditAction(log.action)}
                  </Text>
                  <Text style={styles.timelineDescription}>
                    {log.user_id ? `Actor ${formatIdOrHash(log.user_id)}` : 'System event'}
                    {detailsText ? ` • ${detailsText}` : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
