import { View } from 'react-native';

import { Button } from '@/ui';

import { documentsFilterStyles as styles } from './documents-filter-sheet.styles';

type DocumentsFilterFooterProps = {
  bottomInset: number;
  onClear: () => void;
  onDone: () => void;
};

export function DocumentsFilterFooter({
  bottomInset,
  onClear,
  onDone,
}: DocumentsFilterFooterProps) {
  return (
    <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 24) }]}>
      <Button label="Clear filters" variant="secondary" fullWidth onPress={onClear} />
      <Button label="Done" fullWidth onPress={onDone} />
    </View>
  );
}
