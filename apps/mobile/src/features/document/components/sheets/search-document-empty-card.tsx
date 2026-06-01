import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';

import { searchDocumentSheetColors, searchDocumentSheetStyles } from './search-document-sheet.styles';

export function SearchDocumentEmptyCard() {
  return (
    <View style={searchDocumentSheetStyles.emptyCard}>
      <MaterialIcons name="manage-search" size={30} color={searchDocumentSheetColors.primary} />
      <Text style={searchDocumentSheetStyles.emptyTitle}>Find exact mentions fast</Text>
      <Text style={searchDocumentSheetStyles.emptyBody}>
        Search names, dates, clauses, document numbers, or locations inside this document.
      </Text>
    </View>
  );
}
