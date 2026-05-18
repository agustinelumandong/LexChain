import { Text, View } from 'react-native';

import type { WhitelistGrant } from '@/types';

import { manageWhitelistStyles as styles } from './manage-whitelist.styles';

type ManageWhitelistGrantHeaderProps = {
  selectedGrant?: WhitelistGrant;
};

export function ManageWhitelistGrantHeader({
  selectedGrant,
}: ManageWhitelistGrantHeaderProps) {
  return (
    <View style={styles.grantActionHeader}>
      <Text style={styles.grantActionTitle}>{selectedGrant?.name ?? 'Access grant'}</Text>
      <Text style={styles.grantActionSubtitle}>
        {selectedGrant?.email ?? 'Manage this user access'}
      </Text>
    </View>
  );
}
