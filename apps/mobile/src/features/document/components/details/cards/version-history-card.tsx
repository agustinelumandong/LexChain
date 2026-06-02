import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';

import type { VersionHistoryItem } from '../../../types/document-details.types';
import { documentDetailCardStyles as styles } from './document-detail-card.styles';

function getVersionStatusStyle(status?: string) {
  const normalizedStatus = status?.trim().toUpperCase();

  if (normalizedStatus === 'COMPLETED') {
    return styles.versionStatusCompleted;
  }

  if (
    normalizedStatus === 'PROCESSING' ||
    normalizedStatus === 'QUEUED' ||
    normalizedStatus === 'PENDING'
  ) {
    return styles.versionStatusQueued;
  }

  if (normalizedStatus === 'FAILED') {
    return styles.versionStatusFailed;
  }

  return styles.versionStatusNeutral;
}

export function VersionHistoryCard({
  items,
  onPressVersion,
  onPressViewHistory,
  showAll = false,
}: {
  items: VersionHistoryItem[];
  onPressVersion?: (item: VersionHistoryItem) => void;
  onPressViewHistory?: () => void;
  showAll?: boolean;
}) {
  const visibleItems = showAll ? items : items.slice(0, 3);

  return (
    <View style={styles.versionCard}>
      <View style={styles.versionHeader}>
        <View style={styles.versionHeaderCopy}>
          <View style={styles.cardIconBubble}>
            <MaterialIcons name="history" size={24} color={APP_COLORS.primary} />
          </View>
          <Text style={styles.versionTitle}>Document versions</Text>
        </View>
        {onPressViewHistory ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View full version history"
            onPress={onPressViewHistory}
            style={({ pressed }) => [
              styles.headerAction,
              pressed && styles.headerActionPressed,
            ]}
          >
            <Text style={styles.headerActionText}>View history</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.timeline}>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.label}`}
              onPress={onPressVersion ? () => onPressVersion(item) : undefined}
              style={({ pressed }) => [
                styles.timelineRow,
                pressed && onPressVersion && styles.timelineRowPressed,
              ]}
            >
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
                    <Text style={[styles.versionStatus, getVersionStatusStyle(item.status)]}>
                      {item.statusLabel}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.timelineDescription}>{item.description}</Text>
              </View>
              {onPressVersion ? (
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={APP_COLORS.textMuted}
                  style={styles.versionViewIcon}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
