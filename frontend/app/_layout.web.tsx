import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/global.css";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { Toaster } from "sonner-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, setupQueryFocusListener } from "@/shared/providers";
import { OfflineBanner } from "@/ui";
import { useNetwork } from "@/hooks";
import { WebsiteLandingScreen } from "@/features/website";

export const unstable_settings = {
  anchor: "(tabs)",
};

function isAppOnlyWebPath(pathname: string) {
  return (
    pathname === "/upload" ||
    pathname === "/camera-capture" ||
    pathname === "/capture-review" ||
    pathname === "/processing" ||
    pathname === "/documents" ||
    pathname === "/profile" ||
    pathname.startsWith("/document/") ||
    pathname.startsWith("/verify/")
  );
}

export default function RootLayout() {
  const { isOnline } = useNetwork();
  const pathname = usePathname();
  const router = useRouter();
  const shouldShowWebsiteHome = isAppOnlyWebPath(pathname);
  const [fontsLoaded] = useFonts({
    ...MaterialIcons.font,
  });

  useEffect(() => {
    return setupQueryFocusListener();
  }, []);

  useEffect(() => {
    if (shouldShowWebsiteHome) {
      router.replace("/");
    }
  }, [router, shouldShowWebsiteHome]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {!isOnline ? <OfflineBanner /> : null}
          <BottomSheetModalProvider>
            <StatusBar style="auto" />
            <ThemeProvider value={DefaultTheme}>
              {shouldShowWebsiteHome ? (
                <WebsiteLandingScreen />
              ) : (
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="admin" options={{ headerShown: false }} />
                  <Stack.Screen name="public" options={{ headerShown: false }} />
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
                    name="document/pdf-viewer"
                    options={{ headerShown: false }}
                  />
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
                    options={{ presentation: "modal", title: "Modal" }}
                  />
                </Stack>
              )}
            </ThemeProvider>
          </BottomSheetModalProvider>
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
