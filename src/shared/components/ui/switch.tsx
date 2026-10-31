import { type InputHTMLAttributes, forwardRef, useId } from "react";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> & {
  label: string;
  description?: string;
  className?: string;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, className = "", disabled, "aria-describedby": ariaDescribedBy, "aria-labelledby": ariaLabelledBy, ...props }, ref) => {
    const id = useId();
    const labelId = `${id}-label`;
    const descriptionId = description ? `${id}-description` : undefined;
    const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(" ") || undefined;

    return (
      <label className={`flex min-h-[var(--control-height-sm)] items-center justify-between gap-4 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}>
        <span className="min-w-0">
          <span id={labelId} className="block text-sm font-semibold text-[var(--text-primary)]">{label}</span>
          {description && <span id={descriptionId} className="mt-0.5 block text-sm text-[var(--text-secondary)]">{description}</span>}
        </span>
        <span className="relative flex h-6 w-11 shrink-0 items-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            role="switch"
            disabled={disabled}
            aria-labelledby={ariaLabelledBy ?? labelId}
            aria-describedby={describedBy}
            className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
            {...props}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none block h-6 w-11 rounded-full border border-[var(--border-medium)] bg-[var(--surface-muted)] transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-[var(--brand-blue)] peer-checked:bg-[var(--brand-blue)] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--border-focus)] peer-focus-visible:ring-offset-2 peer-disabled:opacity-50"
          />
        </span>
      </label>
    );
  },
);

Switch.displayName = "Switch";
