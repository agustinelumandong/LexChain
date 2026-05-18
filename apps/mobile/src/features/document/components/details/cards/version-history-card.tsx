import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';

import type { VersionHistoryItem } from '../../../types/document-details.types';
import { documentDetailCardStyles as styles } from './document-detail-card.styles';

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
