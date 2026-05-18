import { View } from 'react-native';

import { DocumentsFilterControlButton } from './documents-filter-control-button';
import { DocumentsFilterSummaryChips } from './documents-filter-summary-chips';
import { documentsFilterControlsStyles } from './documents-filter-controls.styles';

type DocumentsFilterControlsProps = {
  activeSummary: string[];
  sortLabel: string;
  onPressFilter: () => void;
  onPressSort: () => void;
};

export function DocumentsFilterControls({
  activeSummary,
  sortLabel,
  onPressFilter,
  onPressSort,
}: DocumentsFilterControlsProps) {
  return (
    <View style={documentsFilterControlsStyles.wrap}>
      <View style={documentsFilterControlsStyles.controlsRow}>
        <DocumentsFilterControlButton
          iconName="filter-list"
          label="Filter"
          detail={activeSummary.length > 0 ? `${activeSummary.length} active` : 'All'}
          onPress={onPressFilter}
        />

        <DocumentsFilterControlButton
          iconName="swap-vert"
          label="Sort"
          detail={sortLabel}
          onPress={onPressSort}
        />
      </View>

      <DocumentsFilterSummaryChips activeSummary={activeSummary} />
    </View>
  );
}
