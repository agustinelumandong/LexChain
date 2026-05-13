import { useLocalSearchParams } from 'expo-router';

import { PublicVerifyWebScreen } from '@/features/verification/screens/PublicVerifyWebScreen';

export default function PublicVerifyRoute() {
  const { code } = useLocalSearchParams<{ code?: string | string[] }>();
  const normalizedCode = Array.isArray(code) ? code[0] : code;

  return <PublicVerifyWebScreen code={normalizedCode} />;
}
