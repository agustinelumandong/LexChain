import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { documentActionsSheetColors, documentActionsSheetStyles } from './document-actions-sheet.styles';

type DocumentActionItemProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  description: string;
  onPress: () => void;
};

export function DocumentActionItem({
  iconName,
  label,
  description,
  onPress,
}: DocumentActionItemProps) {
  return (
    <Pressable style={documentActionsSheetStyles.actionItem} onPress={onPress}>
      <View style={documentActionsSheetStyles.actionLead}>
        <View style={documentActionsSheetStyles.iconWrap}>
          <MaterialIcons name={iconName} size={18} color={documentActionsSheetColors.primary} />
        </View>

        <View style={documentActionsSheetStyles.actionCopy}>
          <Text style={documentActionsSheetStyles.actionLabel}>{label}</Text>
          <Text style={documentActionsSheetStyles.actionDescription}>{description}</Text>
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={18} color={documentActionsSheetColors.textMuted} />
    </Pressable>
  );
}
