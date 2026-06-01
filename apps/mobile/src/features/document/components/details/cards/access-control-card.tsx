import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';
import { Button } from '@/ui';
import type { WhitelistGrant } from '@/types';

import { documentDetailCardStyles as styles } from './document-detail-card.styles';

export function AccessControlCard({
  allowedCountLabel,
  canManageWhitelist,
  grants,
  onPressManage,
}: {
  allowedCountLabel: string;
  canManageWhitelist: boolean;
  grants?: WhitelistGrant[];
  onPressManage: () => void;
}) {
  const visibleGrants = grants?.filter((grant) => grant.name).slice(0, 4) ?? [];
  const hiddenGrantCount = Math.max((grants?.length ?? 0) - visibleGrants.length, 0);

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
        {visibleGrants.length > 0 ? (
          <View style={styles.partyNameList}>
            {visibleGrants.map((grant) => (
              <View key={grant.id} style={styles.partyRoleRow}>
                <Text style={styles.partyName} numberOfLines={1}>
                  {grant.name}
                </Text>
                <Text style={styles.partyRolePill} numberOfLines={1}>
                  {grant.accessLabel || grant.actionLabel || 'View'}
                </Text>
              </View>
            ))}
            {hiddenGrantCount > 0 ? (
              <Text style={styles.partyNameMuted}>
                +{hiddenGrantCount} more
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
