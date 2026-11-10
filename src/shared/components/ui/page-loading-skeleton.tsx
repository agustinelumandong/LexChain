import { LoadingPulse, LoadingRegion } from './loading-pulse';

type PageHeaderSkeletonProps = {
  backLink?: boolean;
  eyebrow?: boolean;
  action?: boolean;
};

type PageLoadingSkeletonProps = {
  /** Announced to screen readers; the visible placeholder carries no text. */
  label: string;
  /** Set false when the page heading is already on screen. */
  showHeader?: boolean;
  eyebrow?: boolean;
  rows?: number;
  rowClassName?: string;
};

export function PageHeaderSkeleton({ backLink = false, eyebrow = false, action = false }: PageHeaderSkeletonProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-2">
        {backLink && <LoadingPulse className="h-4 w-36" />}
        {eyebrow && <LoadingPulse className="h-3 w-32" />}
        <LoadingPulse className="h-8 w-56 max-w-full" />
        <LoadingPulse className="h-4 w-72 max-w-full" />
      </div>
      {action && <LoadingPulse className="h-11 w-40 shrink-0" />}
    </div>
  );
}

/** Stacked-card pages and lists. Screens with another layout compose their own skeleton. */
export function PageLoadingSkeleton({ label, showHeader = true, eyebrow = false, rows = 3, rowClassName = 'h-20' }: PageLoadingSkeletonProps) {
  return (
    <LoadingRegion label={label} className="w-full space-y-5">
      {showHeader && <PageHeaderSkeleton eyebrow={eyebrow} />}
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <LoadingPulse key={index} className={rowClassName} />
        ))}
      </div>
    </LoadingRegion>
  );
}
