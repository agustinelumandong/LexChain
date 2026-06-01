import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TermsContent } from './terms-content';
import { TermsFooter } from './terms-footer';
import {
  TERMS_BOTTOM_SHEET_COLORS as COLORS,
  termsBottomSheetStyles as styles,
} from './terms-bottom-sheet.styles';
import { useTermsBottomSheet } from './hooks/use-terms-bottom-sheet';

type TermsBottomSheetProps = {
  visible: boolean;
  acceptedTerms: boolean;
  hasReachedEnd: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onToggleAcceptedTerms: () => void;
  onConfirm: () => void;
  onReachedEnd: () => void;
};

export default function TermsBottomSheet({
  visible,
  acceptedTerms,
  hasReachedEnd,
  isSubmitting = false,
  onClose,
  onToggleAcceptedTerms,
  onConfirm,
  onReachedEnd,
}: TermsBottomSheetProps) {
  const termsSheet = useTermsBottomSheet({
    visible,
    hasReachedEnd,
    onReachedEnd,
  });

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

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <BottomSheet
        ref={termsSheet.bottomSheetRef}
        index={0}
        snapPoints={termsSheet.snapPoints}
        onClose={onClose}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheet}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>LEGAL CONSENT</Text>
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.description}>
              Review terms before creating your LexChain account.
            </Text>
          </View>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={20} color={COLORS.navy} />
          </Pressable>
        </View>

        <BottomSheetScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={termsSheet.handleScroll}
        >
          <TermsContent
            acceptedTerms={acceptedTerms}
            hasReachedEnd={hasReachedEnd}
            onToggleAcceptedTerms={onToggleAcceptedTerms}
          />
        </BottomSheetScrollView>

        <TermsFooter
          bottomInset={termsSheet.insets.bottom}
          acceptedTerms={acceptedTerms}
          hasReachedEnd={hasReachedEnd}
          isSubmitting={isSubmitting}
          onConfirm={onConfirm}
        />
      </BottomSheet>
    </View>
  );
}
