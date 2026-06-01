import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GetStartedHero } from '@/features/onboarding/get-started-hero';
import { Button } from '@/shared/components/ui/button';
import { APP_COLORS, fonts } from '@/theme';

type AppLockGateProps = {
  displayName?: string;
  isUnlocking: boolean;
  message?: string;
  onUnlock: () => void;
};

const COLORS = {
  primary: APP_COLORS.primary,
  sky: '#D4ECFF',
  white: APP_COLORS.white,
};

export function AppLockGate({
  displayName,
  isUnlocking,
  message,
  onUnlock,
}: AppLockGateProps) {
  const { height } = useWindowDimensions();
  const isCompactHeight = height < 700;

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.sky, COLORS.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.surface}
      >
        <GetStartedHero compact={isCompactHeight} />
        <View style={styles.content}>
          <View style={styles.sheetBody}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>
                Hello, welcome back{displayName ? `, ${displayName}` : ''}
              </Text>
              {message ? (
                <Text style={styles.body}>{message}</Text>
              ) : (
                <Text style={styles.body}>
                  Unlock to access your documents.
                </Text>
              )}
            </View>

            <View style={styles.actions}>
              <Button
                label="Use Biometrics"
                fullWidth
                disabled={isUnlocking}
                onPress={onUnlock}
                leftIconName="fingerprint"
              />
              <Button
                label="Use PIN"
                variant="secondary"
                fullWidth
                disabled={isUnlocking}
                onPress={onUnlock}
                leftIconName="dialpad"
              />
            </View>
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
    paddingTop: 22,
    paddingBottom: 28,
    gap: 20,
  },
  copyBlock: {
    gap: 10,
  },
  title: {
    color: APP_COLORS.navy,
    fontSize: 29,
    lineHeight: 33,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  body: {
    color: APP_COLORS.textMuted,
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
