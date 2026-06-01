import type { DocumentTypeKey } from '@/types';

import type { DOCUMENT_STATUS_OPTIONS } from '../constants/documents-screen.constants';

export type DocumentFilterStatusKey = (typeof DOCUMENT_STATUS_OPTIONS)[number]['value'];

export type DisplayDocument = {
  id: string;
  title: string;
  summary: string;
  date: string;
  rawDate: string;
  documentType: DocumentTypeKey;
  onChain?: boolean;
  status: DocumentFilterStatusKey;
  snippet?: string;
  documentNumber: number;
  bookNumber: number;
  pageNumber: number;
  series: number;
};
