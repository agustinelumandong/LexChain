import { describe, expect, it } from 'vitest';
import { getProcessingMonitorItems, getProcessingStageLabel } from './processing-monitor';

describe('processing monitor', () => {
  it('provides queued, processing, completed, and failed display labels', () => {
    expect(getProcessingStageLabel('queued')).toBe('Queued');
    expect(getProcessingStageLabel('processing')).toBe('Processing');
    expect(getProcessingStageLabel('completed')).toBe('Completed');
    expect(getProcessingStageLabel('failed')).toBe('Failed');
  });

  it('maps document response fields into monitor rows', () => {
    expect(getProcessingMonitorItems([
      {
        document_id: 'queued-document',
        file_name: 'Queued filing.pdf',
        status: 'queued',
      },
      {
        document_id: 'failed-document',
        file_name: 'Failed filing.pdf',
        status: 'failed',
        failure_reason: 'The PDF could not be read.',
      },
    ])).toEqual([
      {
        id: 'queued-document',
        documentName: 'Queued filing.pdf',
        documentHref: '/portal/documents/queued-document',
        stage: 'queued',
        detail: 'Waiting for the next processing worker.',
      },
      {
        id: 'failed-document',
        documentName: 'Failed filing.pdf',
        documentHref: '/portal/documents/failed-document',
        stage: 'failed',
        detail: 'Processing stopped before a verification record was created.',
        failureReason: 'The PDF could not be read.',
      },
    ]);
  });
});
