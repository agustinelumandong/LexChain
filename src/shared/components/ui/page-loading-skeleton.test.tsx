// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { PageLoadingSkeleton } from './page-loading-skeleton';

afterEach(cleanup);

test('announces the loading message as a status', () => {
  render(<PageLoadingSkeleton label="Loading your request access…" />);

  expect(screen.getByRole('status').textContent).toBe('Loading your request access…');
});

test('keeps the placeholder free of text and hidden from assistive technology', () => {
  const { container } = render(<PageLoadingSkeleton label="Loading requests…" showHeader={false} />);

  expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('');
});
