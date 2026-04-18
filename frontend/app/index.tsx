import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/shared/components/ui/button';
import { GetStartedHero } from '@/features/onboarding/components/get-started-hero';
import { Text, View, StyleSheet } from 'react-native';

const COLORS = {
  primary: '#1689F5',
  primarySoft: '#3AA2FF',
  sky: '#D4ECFF',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  white: '#FFFFFF',
};

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <LinearGradient
        colors={[COLORS.primary,  COLORS.sky, COLORS.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0.0, 0.75, 0.75]}
        style={styles.surface}
      >
          <GetStartedHero />
          <View style={styles.content}>
            <View style={styles.handle} />
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
                onPress={() => router.push('/(auth)/sign-up')}
                rightIconName="arrow-forward"
              />

              <Button
                label="I already have an account"
                variant="ghost"
                fullWidth
                onPress={() => router.push('/(auth)/sign-in')}
              />
            </View>
          </View>
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
    backgroundColor: COLORS.white,
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    shadowColor: '#08264D',
    shadowOpacity: 0.38,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -14 },
    // elevation: 12,
    gap: 20,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  glassGlow: {
    position: 'absolute',
    top: -18,
    left: 24,
    right: 24,
    height: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  copyBlock: {
    gap: 10,
  },
  title: {
    color: COLORS.navy,
    fontSize: 29,
    lineHeight: 33,
    fontWeight: '800',
    fontFamily: 'Inter',
    letterSpacing: -0.6,
  },
  body: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'Inter',
    maxWidth: 320,
  },
  actions: {
    gap: 10,
  },
});
