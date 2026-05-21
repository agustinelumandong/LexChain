import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import heroIllustration from '@/assets/images/lexchain-getstarted-transparent.png';
import { APP_COLORS, fonts } from '@/theme';

type GetStartedHeroProps = {
  compact?: boolean;
};

export function GetStartedHero({ compact = false }: GetStartedHeroProps) {
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
      </View>

      <Text style={styles.brandText} accessibilityRole="header">
        <Text style={styles.brandTextDark}>Lex</Text>
        <Text style={styles.brandTextBlue}>Chain</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: '50%',
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
  brandText: {
    marginTop: -28,
    color: APP_COLORS.navy,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
    fontFamily: fonts.brandBlack,
  },
  brandTextDark: {
    color: APP_COLORS.navy,
    fontFamily: fonts.brandBlack,
    fontWeight: '900',
  },
  brandTextBlue: {
    color: APP_COLORS.primary,
    fontFamily: fonts.brandBlack,
    fontWeight: '900',
  },
});
