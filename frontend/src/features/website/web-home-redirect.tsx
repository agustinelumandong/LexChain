import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { WebsiteLandingScreen } from './screens/WebsiteLandingScreen';

export function WebHomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.replace('/');
      return;
    }

    router.replace('/');
  }, [router]);

  return <WebsiteLandingScreen />;
}
