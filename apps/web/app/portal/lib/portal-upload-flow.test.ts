import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const uploadPage = path.resolve(import.meta.dirname, '../upload/page.tsx');

describe('portal upload workflow', () => {
  it('presents the supported three-step flow and renders the returned processing outcome', async () => {
    const source = await readFile(uploadPage, 'utf8');

    expect(source).toContain('Select PDF');
    expect(source).toContain('Document information');
    expect(source).toContain('Confirm and process');
    expect(source).toContain('Document ID');
    expect(source).toContain('Current status');
    expect(source).toContain('getUploadOutcome');
  });

  it('keeps failure feedback inline and does not add unsupported record metadata', async () => {
    const source = await readFile(uploadPage, 'utf8');

    expect(source).toContain('role="alert"');
    expect(source).toContain('Choose a PDF file.');
    expect(source).not.toMatch(/<label[^>]*>\s*(Category|Access rule|Relationship|Notarial|Version)/i);
  });
});
