import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

import type { VersionHistoryItem } from '../../types/document-details.types';
import { formatDate, formatStatusLabel } from '../../utils/document-details-formatters';

export function VersionHistoryCard({ items }: { items: VersionHistoryItem[] }) {
  return (
    <View style={styles.versionCard}>
      <View style={styles.versionHeader}>
        <View style={styles.cardIconBubble}>
          <MaterialIcons name="history" size={24} color={APP_COLORS.primary} />
        </View>
        <Text style={styles.versionTitle}>Document updates</Text>
      </View>

      <View style={styles.timeline}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timelineDateColumn}>
                <Text
                  style={[
                    styles.timelineDate,
                    item.isCurrent && styles.timelineDateCurrent,
                  ]}
                >
                  {item.date}
                </Text>
              </View>

              <View style={styles.timelineLineColumn}>
                <View
                  style={[
                    styles.timelineDot,
                    item.isCurrent && styles.timelineDotCurrent,
                  ]}
                />
                {!isLast && <View style={styles.timelineLine} />}
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineTitleRow}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      item.isCurrent && styles.timelineLabelCurrent,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.statusLabel ? (
                    <Text style={styles.versionStatus}>{item.statusLabel}</Text>
                  ) : null}
                </View>
                <Text style={styles.timelineDescription}>{item.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function DocumentStatusCard({
  status,
  uploadedAt,
}: {
  status: string;
  uploadedAt: string;
}) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.cardIconBubble}>
        <MaterialIcons name="verified-user" size={24} color={APP_COLORS.primary} />
      </View>

      <View style={styles.statusCopy}>
        <Text style={styles.statusTitle}>Verification</Text>
        <Text style={styles.statusBody}>Last updated {formatDate(uploadedAt)}</Text>
      </View>

      <Text style={styles.statusPill}>{formatStatusLabel(status)}</Text>
    </View>
  );
}

export function AccessControlCard({
  allowedCountLabel,
  canManageWhitelist,
  onPressManage,
}: {
  allowedCountLabel: string;
  canManageWhitelist: boolean;
  onPressManage: () => void;
}) {
  return (
    <View style={styles.accessCard}>
      <View style={styles.cardIconBubble}>
        <MaterialIcons name="shield" size={24} color={APP_COLORS.primary} />
      </View>

      <View style={styles.accessCopy}>
        <Text style={styles.statusTitle}>Access control</Text>
        <Text style={styles.statusBody}>
          {canManageWhitelist
            ? 'Manage who can view or verify this document.'
            : 'Whitelist access is managed by the document issuer.'}
        </Text>
        <Text style={styles.accessCount}>{allowedCountLabel}</Text>
      </View>

      {canManageWhitelist ? (
        <View style={styles.accessAction}>
          <Button
            label="Manage"
            variant="secondary"
            size="sm"
            onPress={onPressManage}
          />
        </View>
      ) : null}
    </View>
  );
}

export function ConfidenceCard({ isReady }: { isReady: boolean }) {
  return (
    <View style={styles.confidenceCard}>
      <View style={styles.cardIconBubble}>
        <MaterialIcons name="verified" size={24} color={APP_COLORS.primary} />
      </View>
      <View style={styles.statusCopy}>
        <Text style={styles.statusTitle}>Summary confidence</Text>
        <Text style={styles.statusBody}>AI-generated summary reliability</Text>
      </View>
      <Text style={styles.confidencePill}>{isReady ? 'High' : 'Pending'}</Text>
    </View>
  );
}

const cardShadow = {
  shadowColor: APP_COLORS.navy,
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
} as const;

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    ...cardShadow,
  },
  accessCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...cardShadow,
  },
  accessCopy: {
    flex: 1,
    gap: 4,
  },
  accessCount: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  accessAction: {
    minWidth: 104,
  },
  statusCopy: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
  },
  statusBody: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  statusPill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#EAF8F0',
    color: '#0C6B3A',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cardIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 20,
    gap: 18,
    ...cardShadow,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  versionTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  timelineDateColumn: {
    width: 82,
    paddingTop: 1,
  },
  timelineDate: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  timelineDateCurrent: {
    color: APP_COLORS.primary,
  },
  timelineLineColumn: {
    alignItems: 'center',
    width: 18,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: APP_COLORS.borderSoft,
    borderWidth: 3,
    borderColor: APP_COLORS.white,
  },
  timelineDotCurrent: {
    backgroundColor: APP_COLORS.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    minHeight: 52,
    backgroundColor: APP_COLORS.borderSoft,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 18,
    gap: 6,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  timelineLabel: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  timelineLabelCurrent: {
    color: APP_COLORS.primary,
  },
  versionStatus: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#EAF8F0',
    color: '#0C6B3A',
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timelineDescription: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  confidenceCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...cardShadow,
  },
  confidencePill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: APP_COLORS.surfaceSoft,
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
