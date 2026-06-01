import { StyleSheet, View } from 'react-native';
import { Button } from '@/ui';
import { APP_COLORS } from '@/theme';

type DocumentDetailsActionsProps = {
  canNotarizeDocument: boolean;
  isAnchored: boolean;
  isNotarizing: boolean;
  isViewer: boolean;
  onPressBlockchainStatus?: () => void;
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
        style={[
          styles.actionButton,
          {
            backgroundColor: '#FDECEF',
            borderWidth: 1.5,
            borderColor: APP_COLORS.danger,
          },
        ]}
        textColor={APP_COLORS.danger}
        iconColor={APP_COLORS.danger}
        onPress={onPressPdf}
      />
      {!isViewer && (
        isAnchored ? (
          <Button
            label="Verify Document"
            variant="secondary"
            size="sm"
            leftIconName="verified"
            style={[
              styles.actionButton,
              {
                backgroundColor: APP_COLORS.surfaceSoft,
                borderWidth: 1.5,
                borderColor: APP_COLORS.primary,
              },
            ]}
            textColor={APP_COLORS.primary}
            iconColor={APP_COLORS.primary}
            onPress={onPressBlockchainStatus}
          />
        ) : (
          <Button
            label="Anchor to Blockchain"
            variant="secondary"
            size="sm"
            leftIconName="verified"
            style={[
              styles.actionButton,
              {
                backgroundColor: APP_COLORS.surfaceSoft,
                borderWidth: 1.5,
                borderColor: APP_COLORS.primary,
              },
            ]}
            textColor={APP_COLORS.primary}
            iconColor={APP_COLORS.primary}
            disabled={!canNotarizeDocument}
            loading={isNotarizing}
            onPress={onPressNotarize}
          />
        )
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
