import { DocumentDetailPage } from '@/features/documents/pages';

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  return <DocumentDetailPage params={params} initialTab={typeof tab === 'string' ? tab : undefined} />;
}
