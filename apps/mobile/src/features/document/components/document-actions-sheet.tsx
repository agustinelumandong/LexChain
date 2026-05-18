import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DocumentActionItem } from './document-action-item';
import { documentActionsSheetStyles } from './document-actions-sheet.styles';

type DocumentActionsSheetProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onPressOpen: () => void;
  onPressVerify: () => void;
  onPressManageWhitelist: () => void;
};

export function DocumentActionsSheet({
  visible,
  title,
  onClose,
  onPressOpen,
  onPressVerify,
  onPressManageWhitelist,
}: DocumentActionsSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['36%'], []);

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      sheet.present();
      return () => {
        sheet.dismiss();
      };
    }

    sheet.dismiss();
    return () => {
      sheet.dismiss();
    };
  }, [visible]);

  const renderBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="close"
      style={documentActionsSheetStyles.backdrop}
    />
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={documentActionsSheetStyles.handle}
      backgroundStyle={documentActionsSheetStyles.sheet}
    >
      <BottomSheetView style={[documentActionsSheetStyles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={documentActionsSheetStyles.header}>
          <Text style={documentActionsSheetStyles.title}>Document actions</Text>
          {title ? <Text style={documentActionsSheetStyles.subtitle}>{title}</Text> : null}
        </View>

        <DocumentActionItem
          iconName="description"
          label="Open"
          description="Preview document details and summary."
          onPress={onPressOpen}
        />

        <DocumentActionItem
          iconName="verified-user"
          label="Verify"
          description="Check integrity status and anchor result."
          onPress={onPressVerify}
        />

        <DocumentActionItem
          iconName="shield"
          label="Manage whitelist"
          description="Review and update document access rules."
          onPress={onPressManageWhitelist}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}
