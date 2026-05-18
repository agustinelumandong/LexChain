import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';

import { parseApiError } from '@/shared/utils/api-error';

export function useErrorToast() {
  const router = useRouter();

  return function showErrorToast(error: unknown) {
    const appError = parseApiError(error);

    toast.error(appError.message);

    if (appError.code === 'UNAUTHORIZED') {
      router.replace('/(auth)/sign-in');
    }

    return appError;
  };
}
