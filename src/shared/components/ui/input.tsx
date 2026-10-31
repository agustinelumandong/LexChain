import { type InputHTMLAttributes, forwardRef, useId } from "react";
import SearchIcon from "@mui/icons-material/Search";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", disabled, readOnly, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? (label || error ? generatedId : undefined);
    const errorId = inputId && error ? `${inputId}-error` : undefined;
    const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined;
    const invalid = error ? true : ariaInvalid;
    const stateStyles = invalid
      ? "border-[var(--status-error)] focus-visible:border-[var(--status-error)] focus-visible:ring-[var(--status-error)]"
      : "border-[var(--border-default)] focus-visible:border-[var(--border-focus)] focus-visible:ring-[var(--border-focus)]";

    return (
      <div className="w-full">
        {label && <label htmlFor={inputId} className="block text-sm font-semibold text-[var(--text-primary)]">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`min-h-[var(--control-height-md)] w-full rounded-[var(--radius-control)] border bg-[var(--surface-page)] px-3.5 text-base text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-placeholder)] focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)] read-only:cursor-default read-only:bg-[var(--surface-muted)] ${stateStyles} ${label ? "mt-1" : ""} ${className}`}
          {...props}
        />
        {error && errorId && <p id={errorId} role="alert" className="mt-1 text-sm text-[var(--status-error)]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

type SearchInputProps = Omit<InputProps, "type" | "label" | "error" | "className"> & {
  "aria-label": string;
  className?: string;
};

export function SearchInput({ className = "", ...props }: SearchInputProps) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <SearchIcon aria-hidden="true" fontSize="small" className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)]" />
      <Input type="search" {...props} className="pl-10" />
    </div>
  );
}
