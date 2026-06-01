import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  documentsFilterControlsColors,
  documentsFilterControlsStyles,
} from './documents-filter-controls.styles';

type DocumentsFilterControlButtonProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  detail?: string;
  onPress: () => void;
};

export function DocumentsFilterControlButton({
  iconName,
  label,
  detail,
  onPress,
}: DocumentsFilterControlButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        documentsFilterControlsStyles.controlButton,
        pressed && documentsFilterControlsStyles.controlButtonPressed,
      ]}
      onPress={onPress}
    >
      <View style={documentsFilterControlsStyles.controlButtonLeft}>
        <MaterialIcons name={iconName} size={18} color={documentsFilterControlsColors.primary} />
        <Text style={documentsFilterControlsStyles.controlButtonLabel}>{label}</Text>
      </View>

      <View style={documentsFilterControlsStyles.controlButtonRight}>
        {detail ? (
          <Text
            style={documentsFilterControlsStyles.controlButtonDetail}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {detail}
          </Text>
        ) : null}
        <MaterialIcons name="chevron-right" size={18} color={documentsFilterControlsColors.textMuted} />
      </View>
    </Pressable>
  );
}
