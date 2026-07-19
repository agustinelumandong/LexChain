import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pageSource = readFileSync(resolve(import.meta.dirname, 'page.tsx'), 'utf8');

it('loads document integrity through the dedicated verification client', () => {
  expect(pageSource).toContain("import { verifyRepositoryDocument } from '../../lib/integrity-api';");
  expect(pageSource).toContain("queryFn: () => verifyRepositoryDocument(id)");
});
