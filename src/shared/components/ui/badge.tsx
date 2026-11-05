import CircleIcon from '@mui/icons-material/Circle';

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-blue-50 text-blue-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
};

export function Badge({ variant = "default", dot = false, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-current/15 px-2.5 py-0.5 text-xs font-bold leading-none ${variantStyles[variant]} ${className}`}
    >
      {dot && <CircleIcon aria-hidden="true" sx={{ fontSize: 8 }} />}
      {children}
    </span>
  );
}
