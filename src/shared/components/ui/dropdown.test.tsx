// @vitest-environment jsdom
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Dropdown } from './dropdown';

function LabeledDropdown({ onChange, onOptionMouseDown, onOptionClick }: { onChange: (value: string) => void; onOptionMouseDown: (defaultPrevented: boolean) => void; onOptionClick: (defaultPrevented: boolean) => void }) {
  const [value, setValue] = useState('document');

  return (
    <label onClick={(event) => {
      if ((event.target as HTMLElement).closest('[role="option"]')) onOptionClick(event.defaultPrevented);
    }} onMouseDown={(event) => {
      if ((event.target as HTMLElement).closest('[role="option"]')) onOptionMouseDown(event.defaultPrevented);
    }}>
      Report scope
      <Dropdown
        ariaLabel="Report scope"
        options={[{ label: 'Document reports', value: 'document' }, { label: 'System reports', value: 'system' }]}
        value={value}
        onChange={(nextValue) => { onChange(nextValue); setValue(nextValue); }}
      />
      <span data-testid="selected-value">{value}</span>
    </label>
  );
}

it('keeps an option selection when its trigger is inside a label', () => {
  const onChange = vi.fn();
  let labelClickWasPrevented = false;
  let optionMouseDownWasPrevented = false;
  render(<LabeledDropdown onChange={onChange} onOptionMouseDown={(defaultPrevented) => { optionMouseDownWasPrevented = defaultPrevented; }} onOptionClick={(defaultPrevented) => { labelClickWasPrevented = defaultPrevented; }} />);

  fireEvent.click(screen.getByRole('combobox', { name: 'Report scope' }));
  const option = screen.getByRole('option', { name: 'System reports' });
  fireEvent.mouseDown(option);
  fireEvent.click(option);

  expect(optionMouseDownWasPrevented).toBe(true);
  expect(labelClickWasPrevented).toBe(true);
  expect(onChange).toHaveBeenCalledWith('system');
  expect(screen.getByTestId('selected-value').textContent).toBe('system');
  expect(screen.queryByRole('listbox')).toBeNull();
});
