import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';

import { documentPdfToolsSheetColors, documentPdfToolsSheetStyles } from './document-pdf-tools-sheet.styles';

type DocumentPdfToolsHeaderProps = {
  title: string;
};

export function DocumentPdfToolsHeader({ title }: DocumentPdfToolsHeaderProps) {
  return (
    <View style={documentPdfToolsSheetStyles.sheetHeader}>
      <View style={documentPdfToolsSheetStyles.sheetIcon}>
        <MaterialIcons name="verified-user" size={20} color={documentPdfToolsSheetColors.primary} />
      </View>
      <View style={documentPdfToolsSheetStyles.sheetHeaderCopy}>
        <Text style={documentPdfToolsSheetStyles.sheetTitle}>Document tools</Text>
        <Text style={documentPdfToolsSheetStyles.sheetSubtitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}
