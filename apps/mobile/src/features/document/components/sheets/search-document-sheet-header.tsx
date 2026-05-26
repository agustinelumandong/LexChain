import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { searchDocumentSheetColors, searchDocumentSheetStyles } from './search-document-sheet.styles';

type SearchDocumentSheetHeaderProps = {
  documentTitle: string;
};

export function SearchDocumentSheetHeader({ documentTitle }: SearchDocumentSheetHeaderProps) {
  return (
    <View style={searchDocumentSheetStyles.header}>
      <View style={searchDocumentSheetStyles.headerIcon}>
        <MaterialIcons name="search" size={18} color={searchDocumentSheetColors.primary} />
      </View>
      <View style={searchDocumentSheetStyles.headerCopy}>
        <Text style={searchDocumentSheetStyles.title}>Search within document</Text>
        <Text style={searchDocumentSheetStyles.subtitle} numberOfLines={1}>
          Keyword lookup in {documentTitle || 'this document'}
        </Text>
      </View>
    </View>
  );
}
