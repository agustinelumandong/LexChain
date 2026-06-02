import type { DocumentTypeKey } from '@/types';

import type { DOCUMENT_STATUS_OPTIONS } from '../constants/documents-screen.constants';

export type DocumentStatusKey = (typeof DOCUMENT_STATUS_OPTIONS)[number]['value'];
export type DocumentFilterStatusKey = 'all' | DocumentStatusKey;

export type DisplayDocument = {
  id: string;
  title: string;
  summary: string;
  date: string;
  rawDate: string;
  documentType: DocumentTypeKey;
  onChain?: boolean;
  status: DocumentStatusKey;
  snippet?: string;
  searchChunkId?: string;
  searchChunkIndex?: number;
  searchRank?: number;
  searchScore?: number;
  documentNumber: number;
  bookNumber: number;
  pageNumber: number;
  series: number;
};
