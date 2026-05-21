import BottomSheet, {
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/ui/button';

import { GetStartedHero } from '../get-started-hero';
import {
  GET_STARTED_COLORS,
  getStartedScreenStyles as styles,
} from './get-started-screen.styles';

function getSheetSnapPoints(height: number) {
  if (height < 680) {
    return ['45%', '46%'];
  }

  if (height < 780) {
    return ['39%', '40%'];
  }

  return ['35%', '36%'];
}

export default function GetStartedScreen() {
  const { push } = useRouter();
  const { height } = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const isCompactHeight = height < 700;
  const sheetSnapPoints = useMemo(() => getSheetSnapPoints(height), [height]);
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 68,
    overshootClamping: true,
    stiffness: 380,
  });

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);

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
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    bottomSheetRef.current?.close();

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      push(href);
    }, 220);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[GET_STARTED_COLORS.primary, GET_STARTED_COLORS.sky, GET_STARTED_COLORS.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.surface}
      >
        <GetStartedHero compact={isCompactHeight} />
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={sheetSnapPoints}
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
                disabled={isNavigating}
                onPress={() => navigateFromLanding('/(auth)/sign-up')}
                rightIconName="arrow-forward"
              />

              <Button
                label="I already have an account"
                variant="ghost"
                fullWidth
                disabled={isNavigating}
                onPress={() => navigateFromLanding('/(auth)/sign-in')}
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </LinearGradient>
    </SafeAreaView>
  );
}
