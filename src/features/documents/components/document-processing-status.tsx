type DocumentProcessingStatusProps = {
  heading: string;
  currentStatus: string;
  description: string;
};

export function DocumentProcessingStatus({ heading, currentStatus, description }: DocumentProcessingStatusProps) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 text-center">
      <div role="progressbar" aria-label={heading} aria-valuetext={currentStatus} className="h-16 w-16 animate-spin rounded-full border-4 border-[#0985E7] border-t-transparent motion-reduce:animate-none" />
      <div role="status" aria-atomic="true">
        <h1 className="text-xl font-black text-[#0C2B49]">{heading}</h1>
        <p className="mt-1 text-sm text-[#64748b]">Current status: {currentStatus}</p>
        <p className="mt-3 text-sm text-[#64748b]">{description}</p>
      </div>
    </div>
  );
}
