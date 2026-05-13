import { Stack, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryKeys } from '@/services/query';
import { AdminLoginScreen } from '@/features/admin/screens/AdminLoginScreen';
import type { SupabaseUser } from '@/types';

function isAdminUser(user?: SupabaseUser | null) {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

export default function ProtectedAdminLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<SupabaseUser>(queryKeys.auth.currentUser);
  const isAuthorized = isAdminUser(user);

  useEffect(() => {
    if (!user) {
      router.replace('/admin/login');
      return;
    }

    if (!isAuthorized) {
      router.replace('/');
    }
  }, [isAuthorized, router, user]);

  if (!user) {
    return <AdminLoginScreen />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
