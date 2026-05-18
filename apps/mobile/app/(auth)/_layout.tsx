import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="sign-in"
          options={{
            animation: 'slide_from_left',
          }}
        />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="callback" />
      </Stack>
    </>
  );
}
