'use client';

import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';

export function NewDocumentAction() {
  const router = useRouter();
  return <button type="button" onClick={() => router.push('/portal/documents/new')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0067B3] px-5 py-2.5 text-sm font-black text-white hover:bg-[#005F9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"><AddIcon aria-hidden="true" sx={{ fontSize: 18 }} />New Document</button>;
}
