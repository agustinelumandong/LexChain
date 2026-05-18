import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { SkeletonBox } from '@/ui';
import type { WhitelistGrant } from '@/types';

import {
  MANAGE_WHITELIST_COLORS as COLORS,
  manageWhitelistStyles as styles,
} from './manage-whitelist.styles';
import { WhitelistGrantRow } from './whitelist-grant-row';

type ManageWhitelistGrantsSectionProps = {
  grants: WhitelistGrant[];
  isLoading: boolean;
  onPressGrantAction?: (grantId: string) => void;
  onOpenGrantMenu: (grant: WhitelistGrant) => void;
};

export function ManageWhitelistGrantsSection({
  grants,
  isLoading,
  onPressGrantAction,
  onOpenGrantMenu,
}: ManageWhitelistGrantsSectionProps) {
  return (
    <View style={styles.grantsBlock}>
      <Text style={styles.grantsTitle}>Current grants</Text>

      {isLoading && grants.length === 0 ? (
        <View style={styles.skeletonList}>
          <SkeletonBox height={52} borderRadius={16} />
          <SkeletonBox height={52} borderRadius={16} />
          <SkeletonBox height={52} borderRadius={16} />
        </View>
      ) : grants.length === 0 ? (
        <ManageWhitelistEmptyState />
      ) : (
        <View style={styles.grantsList}>
          {grants.map((grant) => (
            <WhitelistGrantRow
              key={grant.id}
              name={grant.name}
              accessLabel={grant.accessLabel}
              onPressMenu={() => {
                onPressGrantAction?.(grant.id);
                onOpenGrantMenu(grant);
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function ManageWhitelistEmptyState() {
  return (
    <View style={styles.stateCard}>
      <View style={styles.emptyStateCard}>
        <MaterialIcons name="shield" size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.stateTitle}>No access granted yet</Text>
      <Text style={styles.stateBody}>
        Search for a wallet or user above to add the first whitelist entry.
      </Text>
      <View style={styles.emptyStateHint}>
        <MaterialIcons name="person-add-alt-1" size={14} color={COLORS.primary} />
        <Text style={styles.emptyStateHintText}>Search above to grant first access</Text>
      </View>
    </View>
  );
}
