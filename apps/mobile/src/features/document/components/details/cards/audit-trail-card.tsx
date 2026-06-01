import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';

import { documentDetailCardStyles as styles } from './document-detail-card.styles';

type AuditTrailCardProps = {
  count?: number;
  onPress: () => void;
};

export function AuditTrailCard({ count, onPress }: AuditTrailCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open audit trail"
      onPress={onPress}
      style={({ pressed }) => [
        styles.accessCard,
        pressed && styles.timelineRowPressed,
      ]}
    >
      <View style={styles.cardIconBubble}>
        <MaterialIcons name="fact-check" size={22} color={APP_COLORS.primary} />
      </View>
      <View style={styles.accessCopy}>
        <Text style={styles.statusTitle}>Audit trail</Text>
        <Text style={styles.statusBody}>
          {count === undefined
            ? 'Review document activity and access events.'
            : `${count} recorded event${count === 1 ? '' : 's'}`}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={APP_COLORS.textMuted} />
    </Pressable>
  );
}
