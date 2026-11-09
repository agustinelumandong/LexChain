export type DraftTemplate = { id: string; name: string };

export const DRAFT_TEMPLATES: ReadonlyArray<DraftTemplate> = [
  { id: 'affidavit-of-loss', name: 'Affidavit of Loss' },
  { id: 'special-power-of-attorney', name: 'Special Power of Attorney' },
  { id: 'deed-of-absolute-sale', name: 'Deed of Absolute Sale' },
  { id: 'deed-of-donation', name: 'Deed of Donation' },
  { id: 'contract-of-lease', name: 'Contract of Lease' },
  { id: 'promissory-note', name: 'Promissory Note' },
  { id: 'affidavit-of-one-and-the-same-person', name: 'Affidavit of One and the Same Person' },
  { id: 'affidavit-of-undertaking', name: 'Affidavit of Undertaking' },
  { id: 'extrajudicial-settlement-of-estate', name: 'Extrajudicial Settlement of Estate' },
  { id: 'affidavit-of-discrepancy', name: 'Affidavit of Discrepancy' },
];

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export async function loadDraftTemplate(id: string): Promise<File> {
  if (!DRAFT_TEMPLATES.some((template) => template.id === id)) throw new Error('Choose a template again.');
  const response = await fetch(`/templates/${id}.docx`).catch(() => null);
  if (!response?.ok) throw new Error('Unable to load this template. Check your connection and try again.');
  // The backend rejects an upload unless its extension and declared type agree.
  return new File([await response.blob()], `${id}.docx`, { type: DOCX_MIME_TYPE });
}
