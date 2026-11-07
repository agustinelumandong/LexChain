import type { ReactNode } from 'react';

export type EmptyStateProps = {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  message?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  message = 'No items found',
  action,
  className = '',
}: EmptyStateProps) {
  const displayTitle = title ?? message;

  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-2.5 rounded-xl bg-[#F8FBFF] px-4 py-8 text-center sm:px-6 ${className}`}
    >
      {icon && (
        <span
          className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF4FF] text-[#0067B3]"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div>
        <p className="text-sm font-bold text-[#0C2B49]">{displayTitle}</p>
        {description && (
          <p className="mt-1 text-xs text-[#4B6382]">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
