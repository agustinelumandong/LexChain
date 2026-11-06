'use client';

type DocumentPath = 'google' | 'pdf';

export function DocumentPathSelector({ path, onChange, disabled = false }: {
  path: DocumentPath;
  onChange: (path: DocumentPath) => void;
  disabled?: boolean;
}) {
  const options: { value: DocumentPath; label: string }[] = [
    { value: 'google', label: 'Prepare with Google Docs' },
    { value: 'pdf', label: 'Upload a signed PDF' },
  ];

  return (
    <div role="group" aria-label="Document starting point" className="flex w-full rounded-full bg-[#F2F4F7] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={path === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`min-h-11 flex-1 rounded-full px-3 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60 sm:whitespace-nowrap sm:px-5 ${path === option.value ? 'bg-white text-[#0067B3] shadow-sm' : 'text-[#4B6382] hover:text-[#0067B3]'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
