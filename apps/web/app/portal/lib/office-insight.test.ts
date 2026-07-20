import { describe, expect, it } from 'vitest';
import {
  getOfficeDateRanges,
  getOfficeInsightMetrics,
  getOfficeReports,
} from './office-insight';

describe('office insights', () => {
  it('provides clear date-range labels for the local office views', () => {
    expect(getOfficeDateRanges().map((range) => range.label)).toEqual([
      'Last 7 days',
      'Last 30 days',
      'Last 90 days',
    ]);
  });

  it('represents the local demo office insight totals', () => {
    expect(getOfficeInsightMetrics()).toEqual([
      { label: 'Documents issued', value: 2 },
      { label: 'Documents verified', value: 1 },
      { label: 'On-chain records', value: 1 },
    ]);
  });

  it('provides the three planned report previews', () => {
    expect(getOfficeReports()).toHaveLength(3);
  });
});
