'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const steps = ['Upload', 'Extract', 'Summarize', 'Protect', 'Verify'];

export default function ProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/portal/documents/doc-1');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-white rounded-[18px] border border-[var(--portal-border-soft)] shadow-[0_4px_12px_rgba(19,59,115,0.05)] p-6">
      <h1 className="text-2xl font-extrabold text-[#0f1d3d]">Processing Document</h1>
      <p className="text-sm text-muted-foreground mt-1">Your document is being analyzed...</p>

      <div className="mt-6 space-y-4">
        {steps.map((step, i) => {
          const status = i === 0 ? 'done' : i === 1 ? 'current' : 'pending';
          return (
            <div key={step} className="flex items-center gap-3">
              {status === 'done' && <CheckCircleIcon className="text-green-500" />}
              {status === 'current' && (
                <div className="w-6 h-6 border-2 border-[var(--portal-primary)] border-t-transparent rounded-full animate-spin" />
              )}
              {status === 'pending' && <RadioButtonUncheckedIcon className="text-gray-300" />}
              <span className={
                status === 'done' ? 'line-through text-green-700 font-medium' :
                status === 'current' ? 'font-bold text-[#0f1d3d]' :
                'text-muted-foreground'
              }>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
