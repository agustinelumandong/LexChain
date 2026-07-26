// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { MockToastProvider } from '../components/mock-ui';
import { GeneratedReportsManagementView } from './generated-reports-management-view';

const View = GeneratedReportsManagementView as ComponentType<Record<string, unknown>>;

function renderReports() {
  return render(
    <MockToastProvider>
      <View reports={[]} />
    </MockToastProvider>,
  );
}

afterEach(cleanup);

describe('GeneratedReportsManagementView', () => {
  it('offers only the two fixed system reports with native date fields', () => {
    renderReports();

    expect(screen.getByRole('radio', { name: 'System Users' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'System Audit' })).toBeTruthy();
    expect((screen.getByLabelText('From') as HTMLInputElement).type).toBe('date');
    expect((screen.getByLabelText('To') as HTMLInputElement).type).toBe('date');
  });

  it('generates a compact seeded preview with an honest demo disclaimer', () => {
    renderReports();

    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-03-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-05-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(screen.getByRole('region', { name: 'System Users report' })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'System Users preview' })).toBeTruthy();
    expect(screen.getByText('Atty. Maria Santos')).toBeTruthy();
    expect(screen.getByText('Demo report — generated locally from seeded data and not stored.')).toBeTruthy();
  });

  it('removes scheduling, regeneration, archives, history, and format selection', () => {
    renderReports();

    expect(screen.queryByText(/Schedule|Regenerate|Archive|Report Library|Recent Report Activity/i)).toBeNull();
    expect(screen.queryByLabelText('Format')).toBeNull();
  });
});
