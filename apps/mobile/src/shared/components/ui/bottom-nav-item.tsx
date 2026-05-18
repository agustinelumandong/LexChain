import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text } from 'react-native';

import { bottomNavColors, bottomNavStyles as styles } from './bottom-nav.styles';

type BottomNavItemProps = {
  active?: boolean;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  label?: string;
  onPress: () => void;
};

export function BottomNavItem({
  active = false,
  iconName,
  label,
  onPress,
}: BottomNavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.navItem, active && styles.navItemActive]}
      accessibilityRole="button"
    >
      <MaterialIcons
        name={iconName}
        size={18}
        color={active ? bottomNavColors.primary : bottomNavColors.textMuted}
      />
      {label ? (
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
