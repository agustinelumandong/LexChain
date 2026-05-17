import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';
import { Button } from '@/ui';

import { documentDetailCardStyles as styles } from './document-detail-card.styles';

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
