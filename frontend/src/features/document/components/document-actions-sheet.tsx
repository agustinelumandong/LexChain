import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@/theme';
const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: '#F3F8FF',
  surface: '#FFFFFF',
  borderSoft: '#D7EBFF',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  primary: '#1689F5',
};

type DocumentActionsSheetProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onPressOpen: () => void;
  onPressVerify: () => void;
  onPressManageWhitelist: () => void;
};

type ActionItemProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  description: string;
  onPress: () => void;
};

function ActionItem({
  iconName,
  label,
  description,
  onPress,
}: ActionItemProps) {
  return (
    <Pressable style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionLead}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={iconName} size={18} color={COLORS.primary} />
        </View>

        <View style={styles.actionCopy}>
          <Text style={styles.actionLabel}>{label}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={18} color={COLORS.textMuted} />
    </Pressable>
  );
}

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
      style={styles.backdrop}
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
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheet}
    >
      <BottomSheetView style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Document actions</Text>
          {title ? <Text style={styles.subtitle}>{title}</Text> : null}
        </View>

        <ActionItem
          iconName="description"
          label="Open"
          description="Preview document details and summary."
          onPress={onPressOpen}
        />

        <ActionItem
          iconName="verified-user"
          label="Verify"
          description="Check integrity status and anchor result."
          onPress={onPressVerify}
        />

        <ActionItem
          iconName="shield"
          label="Manage whitelist"
          description="Review and update document access rules."
          onPress={onPressManageWhitelist}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.sheet,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#B9D9FF',
    marginTop: 10,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 18,
    gap: 14,
  },
  header: {
    gap: 6,
    marginBottom: 2,
  },
  title: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  actionItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F7FBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
    gap: 3,
  },
  actionLabel: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  actionDescription: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
