import { describe, expect, it } from 'vitest';
import { getProcessingMonitorItems, getProcessingStageLabel } from './processing-monitor';

describe('processing monitor', () => {
  it('provides queued, processing, completed, and failed display labels', () => {
    expect(getProcessingStageLabel('queued')).toBe('Queued');
    expect(getProcessingStageLabel('processing')).toBe('Processing');
    expect(getProcessingStageLabel('completed')).toBe('Completed');
    expect(getProcessingStageLabel('failed')).toBe('Failed');
  });

  it('keeps failure detail and document links in the local monitor data', () => {
    const failedItem = getProcessingMonitorItems().find((item) => item.stage === 'failed');

    expect(failedItem).toMatchObject({
      documentHref: expect.stringMatching(/^\/portal\/documents\//),
      failureReason: expect.stringContaining('password'),
    });
  });
});
