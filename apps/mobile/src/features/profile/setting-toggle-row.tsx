import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { profileDetailColors, profileDetailStyles } from './profile-detail.styles';

type SettingToggleRowProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function SettingToggleRow({
  iconName,
  title,
  description,
  value,
  onValueChange,
}: SettingToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={({ pressed }) => [profileDetailStyles.toggleRow, pressed && profileDetailStyles.pressed]}
      onPress={() => onValueChange(!value)}
    >
      <View style={profileDetailStyles.toggleLead}>
        <View style={profileDetailStyles.iconWrap}>
          <MaterialIcons name={iconName} size={18} color={profileDetailColors.navy} />
        </View>
        <View style={profileDetailStyles.toggleCopy}>
          <Text style={profileDetailStyles.rowTitle}>{title}</Text>
          <Text style={profileDetailStyles.rowDescription}>{description}</Text>
        </View>
      </View>

      <View style={[profileDetailStyles.switchTrack, value && profileDetailStyles.switchTrackActive]}>
        <View style={[profileDetailStyles.switchThumb, value && profileDetailStyles.switchThumbActive]} />
      </View>
    </Pressable>
  );
}
