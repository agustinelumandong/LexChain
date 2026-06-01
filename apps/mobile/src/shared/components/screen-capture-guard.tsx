import { useSegments } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const SCREEN_CAPTURE_KEY = 'lexchain-sensitive-screens';
const PUBLIC_ROOT_SEGMENTS = new Set(['(auth)', 'auth']);

function isProtectedRoute(rootSegment?: string) {
  if (!rootSegment || rootSegment === 'index') {
    return false;
  }

  return !PUBLIC_ROOT_SEGMENTS.has(rootSegment);
}

export function ScreenCaptureGuard() {
  const segments = useSegments();
  const shouldProtect = isProtectedRoute(segments[0]);

  useEffect(() => {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return undefined;
    }

    if (!shouldProtect) {
      void ScreenCapture.allowScreenCaptureAsync(SCREEN_CAPTURE_KEY);

      if (Platform.OS === 'ios') {
        void ScreenCapture.disableAppSwitcherProtectionAsync();
      }

      return undefined;
    }

    void ScreenCapture.preventScreenCaptureAsync(SCREEN_CAPTURE_KEY);

    if (Platform.OS === 'ios') {
      void ScreenCapture.enableAppSwitcherProtectionAsync(0.65);
    }

    return () => {
      void ScreenCapture.allowScreenCaptureAsync(SCREEN_CAPTURE_KEY);

      if (Platform.OS === 'ios') {
        void ScreenCapture.disableAppSwitcherProtectionAsync();
      }
    };
  }, [shouldProtect]);

  return null;
}
