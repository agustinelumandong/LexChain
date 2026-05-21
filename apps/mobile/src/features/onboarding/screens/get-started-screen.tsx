import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/ui/button';

import { GetStartedHero } from '../get-started-hero';
import {
  GET_STARTED_COLORS,
  getStartedScreenStyles as styles,
} from './get-started-screen.styles';

export default function GetStartedScreen() {
  const { push } = useRouter();
  const { height } = useWindowDimensions();
  const [isNavigating, setIsNavigating] = useState(false);
  const isCompactHeight = height < 700;

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, []),
  );

  const navigateFromLanding = (href: '/(auth)/sign-in' | '/(auth)/sign-up') => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    push(href);
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
        <View style={styles.content}>
          <View style={styles.sheetBody}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>Keep legal files secure, accessible anywhere.</Text>

              <Text style={styles.body}>Upload, summarize, and manage access in one calm workflow.</Text>
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
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
