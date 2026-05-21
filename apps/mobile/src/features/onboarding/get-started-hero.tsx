import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import heroIllustration from '@/assets/images/lexchain-getstarted.svg';

type GetStartedHeroProps = {
  compact?: boolean;
};

export function GetStartedHero({ compact = false }: GetStartedHeroProps) {
  const pulseA = useSharedValue(0);
  const pulseB = useSharedValue(0);
  const pulseC = useSharedValue(0);
  const shieldPulse = useSharedValue(0);

  useEffect(() => {
    const startPulse = (value: typeof pulseA, delay: number) => {
      value.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, {
              duration: 1700,
              easing: Easing.out(Easing.cubic),
            }),
            withTiming(0, {
              duration: 0,
            }),
          ),
          -1,
        ),
      );
    };

    startPulse(pulseA, 0);
    startPulse(pulseB, 520);
    startPulse(pulseC, 1040);
    startPulse(shieldPulse, 260);
  }, [pulseA, pulseB, pulseC, shieldPulse]);

  const pulseStyleA = useAnimatedStyle(() => makePulseStyle(pulseA.value));
  const pulseStyleB = useAnimatedStyle(() => makePulseStyle(pulseB.value));
  const pulseStyleC = useAnimatedStyle(() => makePulseStyle(pulseC.value));
  const shieldPulseStyle = useAnimatedStyle(() => makeShieldPulseStyle(shieldPulse.value));

  return (
    <View style={[styles.hero, compact && styles.heroCompact]}>
      <View style={styles.glowOrb} />
      <View style={styles.glowOrbSecondary} />

      <View style={[styles.illustrationFrame, compact && styles.illustrationFrameCompact]}>
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

function makePulseStyle(progress: number) {
  'worklet';

  return {
    opacity: interpolate(progress, [0, 0.2, 1], [0, 0.5, 0]),
    transform: [
      {
        scale: interpolate(progress, [0, 1], [0.55, 1.85]),
      },
    ],
  };
}

function makeShieldPulseStyle(progress: number) {
  'worklet';

  return {
    opacity: interpolate(progress, [0, 0.18, 1], [0, 0.32, 0]),
    transform: [
      {
        scale: interpolate(progress, [0, 1], [0.74, 1.28]),
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
  heroCompact: {
    height: '45%',
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
  illustrationFrameCompact: {
    width: 360,
    height: 318,
    marginTop: 84,
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
