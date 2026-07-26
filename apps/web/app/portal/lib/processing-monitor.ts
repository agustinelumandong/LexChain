import type { ApiSchema } from '@lexchain/types';

export type ProcessingStage = 'queued' | 'processing' | 'completed' | 'failed';

export type PortalDocument = Pick<
  ApiSchema<'DocumentResponse'>,
  'document_id' | 'file_name' | 'status'
> & {
  failure_reason?: string | null;
};

export type ProcessingMonitorItem = {
  id: string;
  documentName: string;
  documentHref: string;
  stage: ProcessingStage;
  detail: string;
  failureReason?: string;
};

const stageDetails: Record<ProcessingStage, string> = {
  queued: 'Waiting for the next processing worker.',
  processing: 'Extracting text and preparing the verification record.',
  completed: 'Processing completed and the document is ready to review.',
  failed: 'Processing stopped before a verification record was created.',
};

function getProcessingStage(status: string): ProcessingStage {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'queued' || normalized === 'pending') return 'queued';
  if (normalized === 'processing') return 'processing';
  if (normalized === 'failed' || normalized === 'error') return 'failed';
  return 'completed';
}

export function getProcessingStageLabel(stage: ProcessingStage): string {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

export function getProcessingMonitorItems(
  documents: PortalDocument[],
): ProcessingMonitorItem[] {
  return documents.map((document) => {
    const stage = getProcessingStage(document.status);
    return {
      id: document.document_id,
      documentName: document.file_name,
      documentHref: `/portal/documents/${document.document_id}`,
      stage,
      detail: stageDetails[stage],
      ...(document.failure_reason ? { failureReason: document.failure_reason } : {}),
    };
  });
}
