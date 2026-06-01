import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_bottom',
          animationDuration: 180,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="sign-in"
          options={{
            animation: 'ios_from_left',
            animationDuration: 180,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen
          name="sign-up"
          options={{
            animation: 'ios_from_right',
            animationDuration: 180,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen name="callback" />
      </Stack>
    </>
  );
}
