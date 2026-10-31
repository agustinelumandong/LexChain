export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface-tint)] text-[var(--brand-blue)]",
  success: "bg-[var(--status-success-bg)] text-[var(--status-success)]",
  warning: "bg-[var(--status-warning-bg)] text-[var(--status-warning)]",
  danger: "bg-[var(--status-error-bg)] text-[var(--status-error)]",
  info: "bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
