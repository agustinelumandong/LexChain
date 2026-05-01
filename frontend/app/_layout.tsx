import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/global.css";
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

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle("auto");
    }
  }, []);

  useEffect(() => {
    return setupQueryFocusListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {!isOnline ? <OfflineBanner /> : null}
          <BottomSheetModalProvider>
            <StatusBar style="auto" />
            <ThemeProvider value={DefaultTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="upload" options={{ headerShown: false }} />
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
            </ThemeProvider>
          </BottomSheetModalProvider>
          <Toaster
            position="top-center"
            theme="light"
            toastOptions={{
              style: {
                backgroundColor: "#fff",
              },
            }}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
