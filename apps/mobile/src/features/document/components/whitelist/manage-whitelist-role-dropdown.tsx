import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { MOBILE_USER_ROLES, type MobileUserRoleKey } from '../../constants/manage-whitelist.constants';
import { getMobileRoleLabel } from '../../utils/manage-whitelist-labels';
import {
  MANAGE_WHITELIST_COLORS as COLORS,
  manageWhitelistStyles as styles,
} from './manage-whitelist.styles';

type ManageWhitelistRoleDropdownProps = {
  isOpen: boolean;
  selectedRole: MobileUserRoleKey;
  onSelectRole: (role: MobileUserRoleKey) => void;
  onToggle: () => void;
};

export function ManageWhitelistRoleDropdown({
  isOpen,
  selectedRole,
  onSelectRole,
  onToggle,
}: ManageWhitelistRoleDropdownProps) {
  return (
    <View style={styles.dropdownBlock}>
      <Text style={styles.dropdownLabel}>Assign as</Text>
      <Pressable style={styles.dropdownButton} onPress={onToggle}>
        <Text style={styles.dropdownValue}>{getMobileRoleLabel(selectedRole)}</Text>
        <MaterialIcons
          name={isOpen ? 'expand-less' : 'expand-more'}
          size={20}
          color={COLORS.textMuted}
        />
      </Pressable>

      {isOpen ? (
        <View style={styles.dropdownMenu}>
          {MOBILE_USER_ROLES.map((role) => (
            <Pressable
              key={role.key}
              style={styles.dropdownItem}
              onPress={() => onSelectRole(role.key)}
            >
              <Text style={styles.dropdownItemLabel}>{role.label}</Text>
              {selectedRole === role.key ? (
                <MaterialIcons name="check" size={18} color={COLORS.primary} />
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
