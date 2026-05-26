import { StyleSheet, View } from 'react-native';

import { Button } from '@/ui';

type DocumentDetailsActionsProps = {
  canNotarizeDocument: boolean;
  isAnchored: boolean;
  isNotarizing: boolean;
  isViewer: boolean;
  onPressPdf: () => void;
  onPressSearch: () => void;
  onPressNotarize: () => void;
};

export function DocumentDetailsActions({
  canNotarizeDocument,
  isAnchored,
  isNotarizing,
  isViewer,
  onPressPdf,
  onPressSearch,
  onPressNotarize,
}: DocumentDetailsActionsProps) {
  return (
    <View style={styles.actionRow}>
      <Button
        label="View PDF"
        variant="secondary"
        size="sm"
        leftIconName="picture-as-pdf"
        style={styles.actionButton}
        onPress={onPressPdf}
      />
      <Button
        label="Search within document"
        variant="secondary"
        size="sm"
        leftIconName="search"
        style={styles.actionButton}
        onPress={onPressSearch}
      />
      {!isViewer && !isAnchored && (
        <Button
          label="Anchor to Blockchain"
          variant="secondary"
          size="sm"
          leftIconName="verified"
          style={styles.actionButton}
          disabled={!canNotarizeDocument}
          loading={isNotarizing}
          onPress={onPressNotarize}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: 132,
  },
});
