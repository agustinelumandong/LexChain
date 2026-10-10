import { redirect } from 'next/navigation';

export default async function DocumentActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/portal/documents/${encodeURIComponent(id)}`);
}
