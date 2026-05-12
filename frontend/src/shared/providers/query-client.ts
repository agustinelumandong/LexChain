import { QueryClient, focusManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export function setupQueryFocusListener() {
  const subscription = AppState.addEventListener('change', onAppStateChange);

  return () => {
    subscription.remove();
  };
}
