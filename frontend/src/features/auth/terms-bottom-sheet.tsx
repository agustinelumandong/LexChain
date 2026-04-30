import { Button } from '@/ui';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@/theme';
const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: '#F3F8FF',
  surface: '#FFFFFF',
  surfaceSoft: '#EAF4FF',
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  borderSoft: '#D7EBFF',
  success: '#12A150',
};

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [visible]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (hasReachedEnd) {
      return;
    }

    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const threshold = 24;
    const reachedBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - threshold;

    if (reachedBottom) {
      onReachedEnd();
    }
  };

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
    <>
      {visible ? <StatusBar style="light" translucent backgroundColor="transparent" /> : null}

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
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>LEGAL CONSENT</Text>
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.description}>
              Review terms before creating your LexChain account.
            </Text>
          </View>

          <Pressable style={styles.closeButton} onPress={() => bottomSheetRef.current?.dismiss()}>
            <MaterialIcons name="close" size={20} color={COLORS.navy} />
          </Pressable>
        </View>

        <BottomSheetScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Section
            title="1. Account responsibility"
            body="You are responsible for information submitted through your account, including document metadata, uploaded files, and access permissions you grant to others."
          />
          <Section
            title="2. Legal document handling"
            body="LexChain helps organize, summarize, and verify legal documents. You should only upload content you are authorized to manage, review, or share."
          />
          <Section
            title="3. Privacy and confidentiality"
            body="Documents may contain private or sensitive legal information. You agree to use the platform carefully and avoid uploading data in violation of confidentiality duties or applicable law."
          />
          <Section
            title="4. Acceptable use"
            body="You must not use the platform for fraud, identity misrepresentation, unauthorized disclosure, tampering, or unlawful access to protected records."
          />
          <Section
            title="5. Consent to processing"
            body="By continuing, you consent to storage and processing required to provide upload, summary, access control, and verification features within the LexChain system."
          />

          <View style={styles.reachedRow}>
            <MaterialIcons
              name={hasReachedEnd ? 'check-circle' : 'south'}
              size={18}
              color={hasReachedEnd ? COLORS.success : COLORS.primary}
            />
            <Text
              style={[
                styles.reachedText,
                hasReachedEnd && styles.reachedTextDone,
              ]}
            >
              {hasReachedEnd
                ? 'You reached end of terms.'
                : 'Scroll to end to unlock acceptance.'}
            </Text>
          </View>
        </BottomSheetScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <Pressable
            style={[
              styles.checkboxRow,
              !hasReachedEnd && styles.checkboxRowDisabled,
            ]}
            onPress={hasReachedEnd ? onToggleAcceptedTerms : undefined}
          >
            <View
              style={[
                styles.checkbox,
                acceptedTerms && styles.checkboxChecked,
                !hasReachedEnd && styles.checkboxDisabled,
              ]}
            >
              {acceptedTerms ? (
                <MaterialIcons name="check" size={16} color="#FFFFFF" />
              ) : null}
            </View>

            <Text
              style={[
                styles.checkboxLabel,
                !hasReachedEnd && styles.checkboxLabelDisabled,
              ]}
            >
              I accept Terms of Service and Privacy Policy
            </Text>
          </Pressable>

          <Button
            label="Confirm and create account"
            fullWidth
            loading={isSubmitting}
            disabled={!hasReachedEnd || !acceptedTerms || isSubmitting}
            onPress={onConfirm}
          />
        </View>
      </BottomSheetModal>
    </>
  );
}

type SectionProps = {
  title: string;
  body: string;
};

function Section({ title, body }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
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
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerCopy: {
    flex: 1,
    gap: 8,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 14,
  },
  section: {
    gap: 6,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  sectionBody: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  reachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  reachedText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  reachedTextDone: {
    color: COLORS.success,
  },
  footer: {
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxRowDisabled: {
    opacity: 0.58,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxDisabled: {
    backgroundColor: '#F7FBFF',
  },
  checkboxLabel: {
    flex: 1,
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  checkboxLabelDisabled: {
    color: COLORS.textMuted,
  },
});
