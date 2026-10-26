import { BookDetailPage } from '@/features/office/pages';

export default async function BookRoutePage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  return <BookDetailPage bookId={bookId} />;
}
