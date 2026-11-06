const workflowSteps = {
  pdf: [
    { title: 'Upload document' },
    { title: 'Review signed PDF' },
    { title: 'Review text and risks' },
    { title: 'Finalize' },
  ],
  google: [
    { title: 'Set up document' },
    { title: 'Working draft' },
    { title: 'Review signed PDF' },
    { title: 'Review text and risks' },
    { title: 'Finalize' },
  ],
} as const;

export function DocumentProgress({ path, currentStep }: { path: 'pdf' | 'google'; currentStep: number }) {
  const steps = workflowSteps[path];
  return (
    <nav aria-label="Draft and filing progress" className="border-b border-[#D7E4F2] pb-5">
      <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[#4B6382]">Step {currentStep} of {steps.length}</p>
      <ol className={`grid w-full grid-cols-1 gap-2 sm:grid-cols-2 ${path === 'google' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {steps.map((step, index) => {
          const isCurrent = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          const background = isCompleted ? 'bg-[#00528F] text-white' : isCurrent ? 'border border-[#0067B3] bg-[#0067B3]/10 text-[#0C2B49]' : 'border border-[#D7E4F2] bg-white text-[#4B6382]';
          const badge = isCompleted ? 'bg-white text-[#00528F]' : isCurrent ? 'bg-[#0067B3] text-white' : 'border border-[#D7E4E2] bg-[#F4F8FC] text-[#4B6382]';
          return (
            <li key={step.title} aria-current={isCurrent ? 'step' : undefined} className={`flex min-h-[58px] items-center gap-2.5 px-7 py-3 [clip-path:polygon(0_0,calc(100%_-_12px)_0,100%_50%,calc(100%_-_12px)_100%,0_100%,12px_50%)] first:[clip-path:polygon(0_0,calc(100%_-_12px)_0,100%_50%,calc(100%_-_12px)_100%,0_100%)] ${background}`}>
              <span className="sr-only">{isCompleted ? 'Completed: ' : isCurrent ? 'Current step: ' : 'Upcoming: '}</span>
              <span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badge}`}>{isCompleted ? '✓' : index + 1}</span>
              <span className="min-w-0 text-sm font-bold leading-tight">{step.title}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
