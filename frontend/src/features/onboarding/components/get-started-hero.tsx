import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const heroIllustration = require('../../../../assets/images/lexchain-getstarted.svg');

export function GetStartedHero() {
  const [pulseA] = useState(() => new Animated.Value(0));
  const [pulseB] = useState(() => new Animated.Value(0));
  const [pulseC] = useState(() => new Animated.Value(0));
  const [shieldPulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const makePulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    const animationA = makePulse(pulseA, 0);
    const animationB = makePulse(pulseB, 520);
    const animationC = makePulse(pulseC, 1040);
    const shieldAnimation = makePulse(shieldPulse, 260);

    animationA.start();
    animationB.start();
    animationC.start();
    shieldAnimation.start();

    return () => {
      animationA.stop();
      animationB.stop();
      animationC.stop();
      shieldAnimation.stop();
    };
  }, [pulseA, pulseB, pulseC, shieldPulse]);

  const pulseStyleA = makePulseStyle(pulseA);
  const pulseStyleB = makePulseStyle(pulseB);
  const pulseStyleC = makePulseStyle(pulseC);
  const shieldPulseStyle = makeShieldPulseStyle(shieldPulse);

  return (
    <View style={styles.hero}>
      <View style={styles.glowOrb} />
      <View style={styles.glowOrbSecondary} />

      <View style={styles.illustrationFrame}>
        <Image
          source={heroIllustration}
          style={styles.illustration}
          contentFit="contain"
          accessibilityLabel="LexChain secure legal document and blockchain illustration"
        />

        <Animated.View style={[styles.nativePulse, styles.pulseTopLeft, pulseStyleA]} />
        <Animated.View style={[styles.nativePulse, styles.pulseTopRight, pulseStyleB]} />
        <Animated.View style={[styles.nativePulse, styles.pulseBottomRight, pulseStyleC]} />
        <Animated.View style={[styles.shieldPulse, shieldPulseStyle]} />
      </View>
    </View>
  );
}

function makePulseStyle(progress: Animated.Value) {
  return {
    opacity: progress.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.5, 0],
    }),
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.55, 1.85],
        }),
      },
    ],
  };
}

function makeShieldPulseStyle(progress: Animated.Value) {
  return {
    opacity: progress.interpolate({
      inputRange: [0, 0.18, 1],
      outputRange: [0, 0.32, 0],
    }),
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.74, 1.28],
        }),
      },
    ],
  };
}

const styles = StyleSheet.create({
  hero: {
    height: '50%',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  glowOrb: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    top: -40,
    right: -60,
  },
  glowOrbSecondary: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: 32,
    left: -40,
  },
  illustrationFrame: {
    width: 430,
    height: 380,
    marginTop: 120,
    position: 'relative',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  nativePulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(22,137,245,0.16)',
  },
  pulseTopLeft: {
    left: 74,
    top: 101,
  },
  pulseTopRight: {
    right: 66,
    top: 80,
  },
  pulseBottomRight: {
    right: 92,
    bottom: 78,
  },
  shieldPulse: {
    position: 'absolute',
    width: 106,
    height: 118,
    borderRadius: 48,
    right: 72,
    top: 126,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.86)',
    backgroundColor: 'rgba(22,137,245,0.22)',
  },
});
