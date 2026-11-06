// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocumentPathSelector } from './document-path-selector';

afterEach(cleanup);

describe('DocumentPathSelector', () => {
  it('marks the current path and selects the other path without navigation', () => {
    const onChange = vi.fn();
    const { rerender } = render(<DocumentPathSelector path="google" onChange={onChange} />);
    const chooser = screen.getByRole('group', { name: 'Document starting point' });
    const google = within(chooser).getByRole('button', { name: 'Prepare with Google Docs' });
    const pdf = within(chooser).getByRole('button', { name: 'Upload a signed PDF' });
    expect(google.getAttribute('aria-pressed')).toBe('true');
    expect(pdf.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(pdf);
    expect(onChange).toHaveBeenCalledWith('pdf');
    rerender(<DocumentPathSelector path="pdf" onChange={onChange} />);
    expect(pdf.getAttribute('aria-pressed')).toBe('true');
    expect(google.getAttribute('aria-pressed')).toBe('false');
  });
});
