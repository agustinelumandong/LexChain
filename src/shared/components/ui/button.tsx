import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-hover)]",
  secondary: "border border-[var(--border-medium)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-page)]",
  ghost: "text-[var(--text-primary)] hover:bg-[var(--surface-soft)]",
  danger: "bg-[var(--status-error)] text-white hover:opacity-90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-[var(--control-height-sm)] px-3 text-sm",
  md: "min-h-[var(--control-height-md)] px-4 text-sm",
  lg: "min-h-[var(--control-height-lg)] px-5 text-base",
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: "size-[var(--control-height-sm)]",
  md: "size-[var(--control-height-md)]",
  lg: "size-[var(--control-height-lg)]",
};

const baseStyles = "inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, loading, disabled, type = "button", className = "", children, "aria-busy": ariaBusy, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${variantStyles[variant]} ${className}`}
      {...props}
      aria-busy={loading || ariaBusy || undefined}
    >
      {loading ? "Loading…" : children}
    </button>
  ),
);

Button.displayName = "Button";

type IconButtonProps = Omit<ButtonProps, "children" | "fullWidth"> & {
  "aria-label": string;
  children: React.ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "ghost", size = "md", loading, disabled, type = "button", className = "", children, "aria-busy": ariaBusy, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${iconSizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
      aria-busy={loading || ariaBusy || undefined}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = "IconButton";

export const ToggleButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant" | "aria-pressed"> & { pressed: boolean }>(
  ({ pressed, ...props }, ref) => (
    <Button ref={ref} aria-pressed={pressed} variant={pressed ? "primary" : "secondary"} {...props} />
  ),
);

ToggleButton.displayName = "ToggleButton";

export const InlineButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "ghost", size = "sm", ...props }, ref) => (
    <Button ref={ref} variant={variant} size={size} {...props} />
  ),
);

InlineButton.displayName = "InlineButton";
