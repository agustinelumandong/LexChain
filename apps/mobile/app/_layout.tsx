import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/global.css";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { Toaster } from "sonner-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, setupQueryFocusListener } from "@/shared/providers";
import { OfflineBanner } from "@/ui";
import { useNetwork } from "@/hooks";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { isOnline } = useNetwork();
  const [fontsLoaded] = useFonts({
    ...MaterialIcons.font,
  });

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle("auto");
    }
  }, []);

  useEffect(() => {
    return setupQueryFocusListener();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {!isOnline ? <OfflineBanner /> : null}
          <StatusBar style="auto" />
            <ThemeProvider value={DefaultTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
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
                <Stack.Screen name="document/menu" options={{ headerShown: false }} />
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
                  options={{ presentation: "modal", title: "Modal", headerShown: false }}
                />
              </Stack>
            </ThemeProvider>
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
