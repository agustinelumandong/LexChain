import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import {
  MANAGE_WHITELIST_COLORS as COLORS,
  manageWhitelistStyles as styles,
} from './manage-whitelist.styles';

type ManageWhitelistTopBarProps = {
  onBack: () => void;
};

export function ManageWhitelistTopBar({ onBack }: ManageWhitelistTopBarProps) {
  return (
    <View style={styles.topBar}>
      <Pressable style={styles.leftAction} onPress={onBack}>
        <MaterialIcons name="chevron-left" size={20} color={COLORS.navy} />
        <Text style={styles.topBarLabel}>Access</Text>
      </Pressable>

      <MaterialIcons name="groups" size={18} color={COLORS.textMuted} />
    </View>
  );
}
