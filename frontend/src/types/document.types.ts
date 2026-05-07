export type DocumentSortKey = 'newest' | 'oldest' | 'title-az';
export type DocumentTypeKey = 'all' | 'deed-of-sale' | 'lease-contract';
export type DocumentStatusKey = 'all' | 'verified' | 'review-needed';

export type WhitelistGrant = {
  id: string;
  name: string;
  accessLabel: string;
  actionLabel: string;
  email?: string;
};

export type WhitelistSearchResult = {
  id: string;
  name: string;
  email: string;
};

export type ManageWhitelistData = {
  title?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  grants: WhitelistGrant[];
  searchResults: WhitelistSearchResult[];
};

export type DocumentPreviewData = {
  id: string;
  title: string;
  summary: string;
  summaryRows: { label: string; value: string }[];
  sections: (
    | { title: string; body: string; rows?: never }
    | { title: string; rows: { label: string; value: string }[]; body?: never }
  )[];
  whitelist: {
    allowedCountLabel: string;
    helperText: string;
  };
  confidenceLabel: string;
  confidenceValue: string;
};

export type VerifyDocumentData = {
  id: string;
  title: string;
  summary: string;
  summaryRows: { label: string; value: string }[];
  steps: { label: string; status: 'done' | 'verifying' | 'pending' }[];
  offChainHash: string;
  onChainHash: string;
  integrityStatus: string;
};

export type MockDocument = {
  id: string;
  title: string;
  summary: string;
  date: string;
  documentType: DocumentTypeKey;
  status: DocumentStatusKey;
  preview: DocumentPreviewData;
  verify: VerifyDocumentData;
  whitelist: ManageWhitelistData;
};
