import { Text, View } from 'react-native';

import { manageWhitelistStyles as styles } from './manage-whitelist.styles';

export function ManageWhitelistHeader() {
  return (
    <View style={styles.headerBlock}>
      <Text style={styles.eyebrow}>WHITELIST ACCESS</Text>
      <Text style={styles.title}>Manage access</Text>
      <Text style={styles.description}>Grant or revoke document access.</Text>
    </View>
  );
}
