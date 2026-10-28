'use client';

import { Dropdown } from '@/shared/components/ui/dropdown';
import type { DropdownOption, DropdownProps } from '@/shared/components/ui/dropdown';

export type PortalDropdownOption = DropdownOption;
export type PortalDropdownProps = Omit<DropdownProps, 'fullWidth' | 'className' | 'placeholder' | 'ariaLabel'> & {
  ariaLabel: string;
  placeholder?: string;
};

export function PortalDropdown({ placeholder = 'Select an option', ...props }: PortalDropdownProps) {
  return <Dropdown {...props} placeholder={placeholder} fullWidth className="mt-2" />;
}
