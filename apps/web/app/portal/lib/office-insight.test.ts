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

  it('represents the local office insight state with accessible zero-data copy', () => {
    expect(getOfficeInsightMetrics()).toEqual([
      { label: 'Documents issued', value: 0 },
      { label: 'Documents verified', value: 0 },
      { label: 'On-chain records', value: 0 },
    ]);
  });

  it('marks every report download as unavailable in demo mode', () => {
    expect(getOfficeReports()).toEqual(expect.arrayContaining([
      expect.objectContaining({ downloadAvailable: false }),
    ]));
    expect(getOfficeReports().every((report) => report.downloadAvailable === false)).toBe(true);
  });
});
