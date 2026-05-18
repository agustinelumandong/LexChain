import { Text, View } from 'react-native';

import { documentsFilterControlsStyles } from './documents-filter-controls.styles';

type DocumentsFilterSummaryChipsProps = {
  activeSummary: string[];
};

export function DocumentsFilterSummaryChips({
  activeSummary,
}: DocumentsFilterSummaryChipsProps) {
  if (activeSummary.length === 0) {
    return null;
  }

  return (
    <View style={documentsFilterControlsStyles.summaryRow}>
      {activeSummary.map((summary) => (
        <View key={summary} style={documentsFilterControlsStyles.summaryChip}>
          <Text style={documentsFilterControlsStyles.summaryChipText}>{summary}</Text>
        </View>
      ))}
    </View>
  );
}
