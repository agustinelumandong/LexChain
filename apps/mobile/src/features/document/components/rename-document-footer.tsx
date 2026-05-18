import {
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { RefObject } from 'react';
import { View } from 'react-native';

import { Button } from '@/ui';

import { renameDocumentStyles as styles } from './rename-document.styles';

type RenameDocumentFooterProps = BottomSheetFooterProps & {
  bottomInset: number;
  bottomSheetRef: RefObject<BottomSheetModal | null>;
  keyboardHeight: number;
  canRename: boolean;
  isLoading?: boolean;
  onRename: () => void;
};

export function RenameDocumentFooter({
  bottomInset,
  bottomSheetRef,
  keyboardHeight,
  canRename,
  isLoading,
  onRename,
  ...footerProps
}: RenameDocumentFooterProps) {
  return (
    <BottomSheetFooter
      {...footerProps}
      bottomInset={bottomInset}
      style={styles.footerContainer}
    >
      <View
        style={[
          styles.footer,
          keyboardHeight > 0 && {
            transform: [{ translateY: -keyboardHeight }],
          },
        ]}
      >
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => bottomSheetRef.current?.close()}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              label={isLoading ? 'Renaming...' : 'Rename'}
              onPress={onRename}
              disabled={isLoading || !canRename}
              loading={isLoading}
            />
          </View>
        </View>
      </View>
    </BottomSheetFooter>
  );
}
