import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Montserrat_900Black } from "@expo-google-fonts/montserrat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/global.css";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { toast, Toaster } from "sonner-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, setupQueryFocusListener } from "@/shared/providers";
import { useNetwork } from "@/hooks";
import { AppLockDialog } from "@/features/auth/components/app-lock-dialog";
import { AppLockGate } from "@/features/auth/components/app-lock-gate";
import {
  authenticateWithDeviceLock,
  getAppLockEnabled,
  setAppLockEnabled,
} from "@/features/auth/app-lock";
import { authTokenStorage } from "@/shared/utils/secure-storage";
import { ScreenCaptureGuard } from "@/shared/components/screen-capture-guard";
import { queryKeys } from "@/services/query";
import type { SupabaseUser } from "@/types";

export const unstable_settings = {
  anchor: "(tabs)",
};

const OFFLINE_TOAST_ID = 'network-offline';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isOnline } = useNetwork();
  const [isCheckingAppLock, setIsCheckingAppLock] = useState(true);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [appLockMessage, setAppLockMessage] = useState<string | undefined>();
  const hasSeenNetworkStateRef = useRef(false);
  const previousOnlineRef = useRef(isOnline);
  const [fontsLoaded, fontError] = useFonts({
    ...MaterialIcons.font,
    Montserrat_900Black,
  });
  const appReady = fontsLoaded || Boolean(fontError);
  const currentUser = queryClient.getQueryData<SupabaseUser>(queryKeys.auth.currentUser);
  const userMetadata = currentUser?.user_metadata;
  const lockDisplayName = [userMetadata?.f_name, userMetadata?.l_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle("auto");
    }
  }, []);

  useEffect(() => {
    return setupQueryFocusListener();
  }, []);

  useEffect(() => {
    if (appReady) {
      void SplashScreen.hideAsync();
    }
  }, [appReady]);

  useEffect(() => {
    if (!hasSeenNetworkStateRef.current) {
      hasSeenNetworkStateRef.current = true;
      previousOnlineRef.current = isOnline;

      if (!isOnline) {
        toast.warning('You are offline', {
          id: OFFLINE_TOAST_ID,
          duration: Infinity,
          dismissible: false,
        });
      }

      return;
    }

    if (previousOnlineRef.current === isOnline) {
      return;
    }

    previousOnlineRef.current = isOnline;

    if (isOnline) {
      toast.dismiss(OFFLINE_TOAST_ID);
      toast.success('Back online');
      return;
    }

    toast.warning('You are offline', {
      id: OFFLINE_TOAST_ID,
      duration: Infinity,
      dismissible: false,
    });
  }, [isOnline]);

  const unlockApp = useCallback(async () => {
    setIsUnlocking(true);
    setAppLockMessage(undefined);

    try {
      const result = await authenticateWithDeviceLock();

      if (result.status === 'success') {
        setIsAppLocked(false);
        return;
      }

      if (result.status === 'unavailable') {
        await setAppLockEnabled(false);
        setIsAppLocked(false);
        setAppLockMessage(undefined);
        toast.warning(result.message ?? 'Device lock is not available on this phone.');
        return;
      }

      setIsAppLocked(true);
      setAppLockMessage(result.message ?? 'Unlock was cancelled. Try again to continue.');
    } finally {
      setIsUnlocking(false);
    }
  }, []);

  useEffect(() => {
    if (!appReady) {
      return;
    }

    async function checkAppLock() {
      const [token, appLockEnabled] = await Promise.all([
        authTokenStorage.get(),
        getAppLockEnabled(),
      ]);

      if (!token || !appLockEnabled) {
        setIsAppLocked(false);
        setIsCheckingAppLock(false);
        return;
      }

      setIsAppLocked(true);
      setIsCheckingAppLock(false);
      await unlockApp();
    }

    void checkAppLock();
  }, [appReady, unlockApp]);

  if (!appReady || isCheckingAppLock) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <ScreenCaptureGuard />
          {isAppLocked ? (
            <AppLockGate
              displayName={lockDisplayName}
              isUnlocking={isUnlocking}
              message={appLockMessage}
              onUnlock={unlockApp}
            />
          ) : (
            <ThemeProvider value={DefaultTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(auth)"
                  options={{ headerShown: false, animation: "slide_from_right" }}
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
                <Stack.Screen name="invitations" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
                <Stack.Screen name="books/index" options={{ headerShown: false }} />
                <Stack.Screen name="books/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="requests/index" options={{ headerShown: false }} />
                <Stack.Screen name="requests/my" options={{ headerShown: false }} />
                <Stack.Screen name="upload" options={{ headerShown: false }} />
                <Stack.Screen name="profile/account" options={{ headerShown: false }} />
                <Stack.Screen
                  name="profile/notifications"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="profile/security" options={{ headerShown: false }} />
                <Stack.Screen name="profile/privacy" options={{ headerShown: false }} />
                <Stack.Screen name="profile/support" options={{ headerShown: false }} />
                <Stack.Screen name="document/[id]" options={{ headerShown: false }} />
                <Stack.Screen
                  name="document/audit-trail"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="document/menu" options={{ headerShown: false }} />
                <Stack.Screen
                  name="document/version-history"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="document/pdf-viewer"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="verify/[id]" options={{ headerShown: false }} />
                <Stack.Screen
                  name="camera-capture"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="capture-review"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="processing"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Modal", headerShown: false }}
                />
              </Stack>
            </ThemeProvider>
          )}
          <AppLockDialog />
          <Toaster
            position="top-center"
            theme="light"
            toastOptions={{
              style: {
                width: 280,
                borderRadius: 999,
                alignSelf: 'center',
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: "#fff",
              },
            }}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
