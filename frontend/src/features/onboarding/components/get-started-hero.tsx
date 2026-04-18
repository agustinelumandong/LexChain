import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const COLORS = {
  surface: '#F3F8FF',
  white: '#FFFFFF',
};

export function GetStartedHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.glowOrb} />
      <View style={styles.glowOrbSecondary} />

      <View style={styles.placeholderWrap}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderLabel}>Image goes here</Text>
          <Text style={styles.placeholderHint}>
            Replace this box with onboarding artwork or product mockup.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 320,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  placeholderWrap: {
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 44,
    paddingBottom: 6,
  },
  placeholder: {
    height: 250,
    borderRadius: 28,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  placeholderLabel: {
    color: COLORS.white,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderHint: {
    color: COLORS.surface,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});
