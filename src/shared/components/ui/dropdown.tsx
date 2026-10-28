'use client';

import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { usePopup } from '@/shared/components/ui/use-popup';

export type DropdownOption = { label: string; value: string };

export type DropdownProps = {
  options: ReadonlyArray<DropdownOption>;
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  label?: string;
  icon?: ReactNode;
  openUp?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  emptyLabel?: string;
  fullWidth?: boolean;
  invalid?: boolean;
  className?: string;
};

export function Dropdown({
  options,
  value,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  label,
  icon,
  openUp = false,
  description,
  placeholder = 'Select',
  disabled = false,
  emptyLabel = 'No options available',
  fullWidth = false,
  invalid = false,
  className = '',
}: DropdownProps) {
  const { open, setOpen, ref: rootRef } = usePopup();
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeaheadRef = useRef({ query: '', time: 0 });
  const listboxId = useId();
  const descriptionId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const activeOptionIndex = options.length === 0 ? -1 : Math.min(activeIndex, options.length - 1);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  function close(returnFocus = false) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function select(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setActiveIndex(index);
    close(true);
  }

  function moveActive(direction: 1 | -1) {
    if (options.length === 0) return;
    const currentIndex = activeOptionIndex >= 0 ? activeOptionIndex : 0;
    setActiveIndex((currentIndex + direction + options.length) % options.length);
  }

  function handleTypeahead(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey || event.key === ' ') return;

    const previous = typeaheadRef.current;
    const query = event.timeStamp - previous.time < 500 && previous.query.toLowerCase() !== event.key.toLowerCase()
      ? `${previous.query}${event.key}`
      : event.key;
    typeaheadRef.current = { query, time: event.timeStamp };
    if (options.length === 0) return;

    const startIndex = activeOptionIndex >= 0 ? activeOptionIndex : selectedIndex;
    const match = Array.from({ length: options.length }, (_, offset) => (startIndex + offset + 1 + options.length) % options.length)
      .find((index) => options[index].label.toLocaleLowerCase().startsWith(query.toLocaleLowerCase()));
    if (match !== undefined) {
      setActiveIndex(match);
      setOpen(true);
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (open) moveActive(event.key === 'ArrowDown' ? 1 : -1);
      else {
        const startIndex = selectedIndex >= 0 ? selectedIndex : 0;
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        if (options.length > 0) setActiveIndex((startIndex + direction + options.length) % options.length);
        setOpen(true);
      }
    } else if (event.key === 'Home' && options.length > 0) {
      event.preventDefault();
      setActiveIndex(0);
      setOpen(true);
    } else if (event.key === 'End' && options.length > 0) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      setOpen(true);
    } else if ((event.key === 'Enter' || event.key === ' ') && open && activeOptionIndex >= 0) {
      event.preventDefault();
      select(activeOptionIndex);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      close(true);
    } else {
      handleTypeahead(event);
    }
  }

  const accessibleLabel = ariaLabel ?? (label ? `${label}: ${selected?.label ?? placeholder}` : undefined);
  const listboxLabel = label ?? ariaLabel ?? 'Options';

  return (
    <div ref={rootRef} className={`${fullWidth ? 'w-full' : 'inline-block'} relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-label={accessibleLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy ?? (description ? descriptionId : undefined)}
        aria-invalid={invalid || undefined}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && activeOptionIndex >= 0 ? `${listboxId}-option-${activeOptionIndex}` : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (open) close();
          else {
            setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
            setOpen(true);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`flex min-h-[var(--control-height-md)] items-center justify-between gap-3 rounded-[var(--radius-control)] border bg-[var(--surface-card)] px-3 py-2 text-left text-sm font-semibold text-[var(--text-primary)] outline-none transition disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)] disabled:text-[var(--text-secondary)] ${fullWidth ? 'w-full' : ''} ${invalid ? 'border-[var(--status-error)] hover:border-[var(--status-error)] focus-visible:ring-2 focus-visible:ring-[var(--status-error)]/30' : 'border-[var(--border-default)] hover:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]/30'}`}
      >
        {icon}
        <span className={fullWidth ? 'flex-1' : ''}>{selected?.label ?? placeholder}</span>
        <KeyboardArrowDownIcon fontSize="small" aria-hidden className={`shrink-0 text-[var(--text-secondary)] transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {description ? <span id={descriptionId} className="sr-only">{description}</span> : null}
      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={listboxLabel}
          aria-labelledby={ariaLabelledBy}
          className={`absolute left-0 z-50 max-h-64 overflow-y-auto rounded-[var(--radius-control)] border border-[var(--border-default)] bg-[var(--surface-card)] p-1 shadow-lg ${fullWidth ? 'w-full' : 'min-w-full'} ${openUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}
        >
          {options.length === 0 ? (
            <p className="px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)]">{emptyLabel}</p>
          ) : (
            options.map((option, index) => (
              <div
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={(event) => {
                  event.preventDefault();
                  select(index);
                }}
                className={`flex min-h-[var(--control-height-sm)] cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  index === activeOptionIndex ? 'bg-[var(--surface-soft)] text-[var(--brand-blue)]' : 'text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
                }`}
              >
                <span>{option.label}</span>
                {index === selectedIndex ? <CheckIcon fontSize="small" aria-hidden /> : null}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
