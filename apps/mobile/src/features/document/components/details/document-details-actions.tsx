import { StyleSheet, View } from 'react-native';

import { Button } from '@/ui';

type DocumentDetailsActionsProps = {
  canNotarizeDocument: boolean;
  isAnchored: boolean;
  isNotarizing: boolean;
  isViewer: boolean;
  onPressBlockchainStatus: () => void;
  onPressPdf: () => void;
  onPressNotarize: () => void;
};

export function DocumentDetailsActions({
  canNotarizeDocument,
  isAnchored,
  isNotarizing,
  isViewer,
  onPressBlockchainStatus,
  onPressPdf,
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
        label="Blockchain Status"
        variant="secondary"
        size="sm"
        leftIconName="account-balance"
        style={styles.actionButton}
        onPress={onPressBlockchainStatus}
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
