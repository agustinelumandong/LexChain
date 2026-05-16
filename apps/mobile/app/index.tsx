import BottomSheet, {
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';

import { Button } from '@/ui';
import { GetStartedHero } from '@/features/onboarding';
import { Text, View, StyleSheet } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  primarySoft: '#3AA2FF',
  sky: '#D4ECFF',
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  white: APP_COLORS.white,
  borderSoft: APP_COLORS.borderSoft,
};

const SHEET_SNAP_POINTS = ['35%', '36%'];

export default function Index() {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 68,
    overshootClamping: true,
    stiffness: 380,
  });

  useFocusEffect(
    useCallback(() => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }

      focusTimeoutRef.current = setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 40);

      return () => {
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
          focusTimeoutRef.current = null;
        }

        bottomSheetRef.current?.close();
      };
    }, []),
  );

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  const navigateFromLanding = (href: '/(auth)/sign-in' | '/(auth)/sign-up') => {
    bottomSheetRef.current?.close();

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      router.push(href);
    }, 220);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
    <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.sky, COLORS.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.surface}
      >
        <GetStartedHero />
        <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={SHEET_SNAP_POINTS}
        animateOnMount
        enableDynamicSizing={false}
        enableOverDrag
        enablePanDownToClose={false}
        overDragResistanceFactor={8}
        animationConfigs={animationConfigs}
        backgroundStyle={styles.content}
        handleIndicatorStyle={styles.handle}
        detached={false}
      >
        <BottomSheetView style={styles.sheetBody}>
          <View style={styles.copyBlock}>
            <Text style={styles.title}>
              Keep legal files secure, accessible anywhere.
            </Text>

            <Text style={styles.body}>
              Upload, summarize, and manage access in one calm workflow.
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              label="Get started"
              fullWidth
              onPress={() => navigateFromLanding('/(auth)/sign-up')}
              rightIconName="arrow-forward"
            />

            <Button
              label="I already have an account"
              variant="ghost"
              fullWidth
              onPress={() => navigateFromLanding('/(auth)/sign-in')}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  surface: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: COLORS.white,
    shadowColor: '#08264D',
    shadowOpacity: 0.38,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -14 },
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 28,
    gap: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.borderSoft,
  },
  copyBlock: {
    gap: 10,
  },
  title: {
    color: COLORS.navy,
    fontSize: 29,
    lineHeight: 33,
    fontWeight: '800',
    fontFamily: fonts.regular,
    letterSpacing: -0.6,
  },
  body: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: fonts.regular,
    maxWidth: 320,
  },
  actions: {
    gap: 10,
  },
});
