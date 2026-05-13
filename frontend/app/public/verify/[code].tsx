import { useLocalSearchParams } from 'expo-router';

import { PublicVerifyWebScreen } from '@/features/verification/screens/PublicVerifyWebScreen';

export default function PublicVerifyRoute() {
  const { code } = useLocalSearchParams<{ code: string }>();

  return <PublicVerifyWebScreen code={code} />;
}
