import { statSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getGoogleDraftUploadFileError } from '@/features/documents/document-draft-api';
import { DRAFT_TEMPLATES, loadDraftTemplate } from '@/features/documents/draft-templates';

afterEach(() => { vi.unstubAllGlobals(); });

describe('draft templates', () => {
  it.each(DRAFT_TEMPLATES)('ships a non-empty file for $name', ({ id }) => {
    expect(statSync(join(process.cwd(), 'public', 'templates', `${id}.docx`)).size).toBeGreaterThan(0);
  });

  it('loads a template as a .docx the draft upload accepts', async () => {
    const fetchMock = vi.fn(async () => new Response('template-bytes'));
    vi.stubGlobal('fetch', fetchMock);

    const file = await loadDraftTemplate('deed-of-absolute-sale');

    expect(fetchMock).toHaveBeenCalledWith('/templates/deed-of-absolute-sale.docx');
    expect(file.name).toBe('deed-of-absolute-sale.docx');
    expect(file.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(getGoogleDraftUploadFileError(file)).toBeNull();
  });

  it('asks for a new choice without fetching when the template is not listed', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadDraftTemplate('drive-file-id')).rejects.toThrow('Choose a template again.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['is missing', async () => new Response('', { status: 404 })],
    ['cannot be reached', async () => { throw new TypeError('Failed to fetch'); }],
  ])('reports a readable error when the template file %s', async (_case, fetchImpl) => {
    vi.stubGlobal('fetch', vi.fn(fetchImpl));

    await expect(loadDraftTemplate('deed-of-absolute-sale')).rejects.toThrow('Unable to load this template. Check your connection and try again.');
  });
});
