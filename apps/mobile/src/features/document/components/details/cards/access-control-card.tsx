import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';
import { Button } from '@/ui';

import { documentDetailCardStyles as styles } from './document-detail-card.styles';

export function AccessControlCard({
  allowedCountLabel,
  canManageWhitelist,
  partyNames,
  onPressManage,
}: {
  allowedCountLabel: string;
  canManageWhitelist: boolean;
  partyNames?: string[];
  onPressManage: () => void;
}) {
  const visiblePartyNames = partyNames?.filter(Boolean).slice(0, 4) ?? [];
  const hiddenPartyCount = Math.max((partyNames?.length ?? 0) - visiblePartyNames.length, 0);

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
        {!canManageWhitelist && visiblePartyNames.length > 0 ? (
          <View style={styles.partyNameList}>
            {visiblePartyNames.map((name) => (
              <Text key={name} style={styles.partyName} numberOfLines={1}>
                {name}
              </Text>
            ))}
            {hiddenPartyCount > 0 ? (
              <Text style={styles.partyNameMuted}>
                +{hiddenPartyCount} more
              </Text>
            ) : null}
          </View>
        ) : null}
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
