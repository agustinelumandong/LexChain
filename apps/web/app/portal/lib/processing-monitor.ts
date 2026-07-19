export type ProcessingStage = 'queued' | 'processing' | 'completed' | 'failed';

export type ProcessingMonitorItem = {
  id: string;
  documentName: string;
  documentHref: string;
  stage: ProcessingStage;
  detail: string;
  failureReason?: string;
};

const processingMonitorItems: ProcessingMonitorItem[] = [
  {
    id: 'demo-queued-deed',
    documentName: 'Deed of Sale — Rivera Property',
    documentHref: '/portal/documents/demo-queued-deed',
    stage: 'queued',
    detail: 'Waiting for the next processing worker.',
  },
  {
    id: 'demo-processing-affidavit',
    documentName: 'Affidavit of Loss — Santos',
    documentHref: '/portal/documents/demo-processing-affidavit',
    stage: 'processing',
    detail: 'Extracting text and preparing the verification record.',
  },
  {
    id: 'demo-completed-contract',
    documentName: 'Service Agreement — Northwind',
    documentHref: '/portal/documents/demo-completed-contract',
    stage: 'completed',
    detail: 'Processing completed and the document is ready to review.',
  },
  {
    id: 'demo-failed-lease',
    documentName: 'Commercial Lease — Mabini Avenue',
    documentHref: '/portal/documents/demo-failed-lease',
    stage: 'failed',
    detail: 'Processing stopped before a verification record was created.',
    failureReason: 'The uploaded PDF is password-protected and could not be opened for text extraction.',
  },
];

export function getProcessingStageLabel(stage: ProcessingStage): string {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

export function getProcessingMonitorItems(): readonly ProcessingMonitorItem[] {
  return processingMonitorItems;
}
