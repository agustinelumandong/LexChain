import { Text, View } from 'react-native';

import { documentsFilterStyles as styles } from './documents-filter-sheet.styles';

export function DocumentsFilterHeader() {
  return (
    <View style={styles.headerBlock}>
      <Text style={styles.eyebrow}>DOCUMENT FILTERS</Text>
      <Text style={styles.title}>Filter documents</Text>
      <Text style={styles.description}>
        Narrow your document list by type, status, or date.
      </Text>
    </View>
  );
}
