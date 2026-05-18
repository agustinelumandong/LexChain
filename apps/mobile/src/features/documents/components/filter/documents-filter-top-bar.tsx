import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  DOCUMENTS_FILTER_COLORS as COLORS,
  documentsFilterStyles as styles,
} from './documents-filter-sheet.styles';

type DocumentsFilterTopBarProps = {
  onBack: () => void;
};

export function DocumentsFilterTopBar({ onBack }: DocumentsFilterTopBarProps) {
  return (
    <View style={styles.topBar}>
      <Pressable style={styles.leftAction} onPress={onBack}>
        <MaterialIcons name="chevron-left" size={20} color={COLORS.navy} />
        <Text style={styles.topBarLabel}>Documents</Text>
      </Pressable>

      <MaterialIcons name="filter-list" size={18} color={COLORS.textMuted} />
    </View>
  );
}
