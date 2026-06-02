import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

import type { DocumentsHeaderAction } from './documents-header';

type DocumentsHeaderActionsSheetProps = {
  visible: boolean;
  actions: DocumentsHeaderAction[];
  onClose: () => void;
};

export function DocumentsHeaderActionsSheet({
  visible,
  actions,
  onClose,
}: DocumentsHeaderActionsSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['34%', '54%'], []);
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      bottomSheetRef.current?.close();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        containerStyle={styles.overlay}
        onClose={onClose}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.sheetHeader}>
          <View style={styles.sheetIcon}>
            <MaterialIcons name="more-horiz" size={22} color={APP_COLORS.primary} />
          </View>
          <View style={styles.sheetHeaderCopy}>
            <Text style={styles.sheetTitle}>Document actions</Text>
            <Text style={styles.sheetSubtitle}>Open document tools and request queues.</Text>
          </View>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => {
                onClose();
                action.onPress();
              }}
              style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
            >
              <View style={styles.actionLead}>
                <View style={styles.actionIcon}>
                  <MaterialIcons name={action.iconName} size={20} color={APP_COLORS.navy} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </View>
              {action.badgeCount ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {action.badgeCount > 99 ? '99+' : action.badgeCount}
                  </Text>
                </View>
              ) : (
                <MaterialIcons name="chevron-right" size={20} color={APP_COLORS.textMuted} />
              )}
            </Pressable>
          ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 10000,
    elevation: 10000,
  },
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: APP_COLORS.white,
  },
  handleIndicator: {
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: APP_COLORS.borderSoft,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.borderSoft,
  },
  sheetIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surfaceSoft,
  },
  sheetHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  sheetTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 10,
  },
  actionRow: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionRowPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  actionLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surfaceSoft,
  },
  actionLabel: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: APP_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: APP_COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '900',
  },
});
