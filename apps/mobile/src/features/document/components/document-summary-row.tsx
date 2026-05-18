import { Text, View } from 'react-native';

import type { SummaryRow } from './document-summary-card';
import { documentSummaryCardStyles } from './document-summary-card.styles';

type DocumentSummaryRowProps = {
  row: SummaryRow;
};

export function DocumentSummaryRow({ row }: DocumentSummaryRowProps) {
  return (
    <View style={documentSummaryCardStyles.row}>
      <Text style={documentSummaryCardStyles.rowLabel}>{row.label}</Text>
      <Text style={documentSummaryCardStyles.rowValue}>{row.value}</Text>
    </View>
  );
}
