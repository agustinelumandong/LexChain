import { type InputHTMLAttributes, forwardRef } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", disabled, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      disabled={disabled}
      className={`h-5 w-5 shrink-0 accent-[var(--brand-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  ),
);

Checkbox.displayName = "Checkbox";
