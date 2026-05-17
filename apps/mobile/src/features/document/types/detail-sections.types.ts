import type { DetailBodyBlock } from './document-details.types';

export type DetailRow = {
  label: string;
  value: string;
};

export type DetailRiskBlock = Extract<DetailBodyBlock, { kind: 'risk' }>;

export type DetailSection =
  | {
      title: string;
      body: string;
      bodyBlocks?: never;
      rows?: never;
    }
  | {
      title: string;
      bodyBlocks: DetailBodyBlock[];
      body?: never;
      rows?: never;
    }
  | {
      title: string;
      rows: DetailRow[];
      body?: never;
      bodyBlocks?: never;
    };
