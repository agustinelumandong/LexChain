"use client";

import { usePopup } from "@/shared/components/ui/use-popup";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useId } from "react";

type Option = { label: string; value: string };

type DropdownProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  openUp?: boolean;
  description?: string;
};

export function Dropdown({ options, value, onChange, icon, openUp = false, description }: DropdownProps) {
  const { open, setOpen, ref } = usePopup();
  const descriptionId = useId();

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={description ? descriptionId : undefined}
        onClick={() => setOpen(!open)}
        className="flex min-h-[var(--control-height-md)] cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border-default)] bg-[var(--surface-page)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] outline-none transition hover:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]/30"
      >
        {icon}
        <span>{selected?.label ?? "Select"}</span>
        <KeyboardArrowDownIcon fontSize="small" className={`text-[#64748b] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {description ? <span id={descriptionId} className="sr-only">{description}</span> : null}
      {open && (
        <div className={`absolute left-0 z-50 min-w-full overflow-hidden rounded-[var(--radius-control)] border border-[var(--border-default)] bg-[var(--surface-card)] shadow-lg ${openUp ? "bottom-full mb-1" : "top-full mt-1"}`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false); ref.current?.querySelector("button")?.focus(); }}
              className={`flex min-h-[var(--control-height-sm)] w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-semibold transition hover:bg-[var(--surface-soft)] ${
                option.value === value ? "bg-[var(--surface-soft)] text-[var(--brand-blue)]" : "text-[var(--text-primary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
