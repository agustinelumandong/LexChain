// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MetricCard } from '@/features/portal/components/portal-metric-card';

afterEach(cleanup);

describe('MetricCard', () => {
  it('wraps long metric labels, values, and details in narrow grid columns', () => {
    const { container } = render(
      <MetricCard icon={<span aria-hidden="true">✓</span>} label="Failed Documents" value="Unavailable" detail="Documents waiting on processing" color="text-[#0C2B49]" />,
    );

    expect(container.querySelector('article')?.className).toContain('min-w-0');
    for (const copy of ['Failed Documents', 'Unavailable', 'Documents waiting on processing']) {
      const text = screen.getByText(copy);
      expect(text.className).toContain('break-words');
      expect(text.className).not.toContain('truncate');
    }
  });
});
