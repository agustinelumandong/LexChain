// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { DocumentDetailSkeleton, DocumentListSkeleton } from './document-loading-skeletons';

afterEach(cleanup);

test('document detail skeleton announces one status and shows no placeholder text', () => {
  render(<DocumentDetailSkeleton />);

  const status = screen.getByRole('status', { name: 'Loading document' });
  expect(status.textContent).toBe('Loading document');
  expect(within(status).queryByRole('tab')).toBeNull();
});

test('document list skeleton keeps the documents loading label', () => {
  render(<DocumentListSkeleton />);

  expect(screen.getByLabelText('Loading documents')).toBeTruthy();
});
