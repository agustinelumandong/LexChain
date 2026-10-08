import { AccountPage } from '@/features/account/pages';

type AccountSearchParams = Record<string, string | string[] | undefined>;

export default async function AccountSettingsPage({ searchParams }: { searchParams: Promise<AccountSearchParams> }) {
  const params = await searchParams;
  const google = params.google;
  const message = params.message;

  return (
    <AccountPage
      google={Array.isArray(google) ? google[0] : google}
      message={Array.isArray(message) ? message[0] : message}
    />
  );
}
