import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { documentsSortSheetColors, documentsSortSheetStyles } from './documents-sort-sheet.styles';

type DocumentsSortTopBarProps = {
  onBack: () => void;
};

export function DocumentsSortTopBar({ onBack }: DocumentsSortTopBarProps) {
  return (
    <View style={documentsSortSheetStyles.topBar}>
      <Pressable style={documentsSortSheetStyles.leftAction} onPress={onBack}>
        <MaterialIcons name="chevron-left" size={20} color={documentsSortSheetColors.navy} />
        <Text style={documentsSortSheetStyles.topBarLabel}>Documents</Text>
      </Pressable>

      <MaterialIcons name="swap-vert" size={18} color={documentsSortSheetColors.textMuted} />
    </View>
  );
}
