import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pageSource = readFileSync(resolve(import.meta.dirname, 'page.tsx'), 'utf8');

it('loads document integrity through the dedicated verification client', () => {
  expect(pageSource).toContain("import { verifyRepositoryDocument } from '../../lib/integrity-api';");
  expect(pageSource).toContain("queryFn: () => verifyRepositoryDocument(id)");
});

it('derives the detail integrity state from the repository lookup only', () => {
  expect(pageSource).toContain("getIntegrityUiState({ record: chainQ.data, requestFailed: chainQ.isError })");
  expect(pageSource).toContain('integrityState={integrityState}');
  expect(pageSource).toContain('onRetry={() => void chainQ.refetch()}');
  expect(pageSource).not.toContain('hasBlockchainStatus');
  expect(pageSource).not.toContain('Blockchain record available');
});

it('links issuers with an awaiting-review document to extracted text review', () => {
  expect(pageSource).toContain("actions.includes('Review extracted text')");
  expect(pageSource).toContain('href={`/portal/documents/${id}/review`}');
});
