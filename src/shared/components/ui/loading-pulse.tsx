import type { ReactNode } from "react";

type LoadingPulseProps = {
  className?: string;
};

type LoadingPanelProps = LoadingPulseProps & {
  children?: ReactNode;
};

type LoadingRegionProps = LoadingPanelProps & {
  label: string;
};

/** Announces loading to assistive technology; placeholders inside stay decorative. */
export function LoadingRegion({ label, className = "", children }: LoadingRegionProps) {
  return (
    <div role="status" aria-label={label} className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Pulsing white card for placeholders that sit directly on the portal background. */
export function LoadingPulse({ className = "" }: LoadingPulseProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-[18px] border border-[var(--border-soft)] bg-white motion-safe:animate-pulse ${className}`}
    />
  );
}

/** Static white card holding LoadingLine placeholders. */
export function LoadingPanel({ className = "", children }: LoadingPanelProps) {
  return (
    <div aria-hidden="true" className={`rounded-[18px] border border-[var(--border-soft)] bg-white ${className}`}>
      {children}
    </div>
  );
}

/** Pulsing text or control placeholder for use inside a white card. */
export function LoadingLine({ className = "" }: LoadingPulseProps) {
  return <div className={`rounded-full bg-[var(--border-soft)] motion-safe:animate-pulse ${className}`} />;
}

/** Form field placeholder: label line above an empty input outline. */
export function LoadingField({ className = "" }: LoadingPulseProps) {
  return (
    <div className={className}>
      <LoadingLine className="h-4 w-32" />
      <div className="mt-2 h-11 rounded-xl border border-[#D7E4F2]" />
    </div>
  );
}
