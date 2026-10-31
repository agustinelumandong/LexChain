import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  padded?: boolean;
};

export function Card({ children, className = "", padded = true, ...props }: CardProps) {
  return (
    <article
      className={`rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-card)] ${padded ? "p-5" : ""} ${className}`}
      {...props}
    >
      {children}
    </article>
  );
}
