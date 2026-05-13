import { Stack } from 'expo-router';

export default function ProtectedAdminLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
