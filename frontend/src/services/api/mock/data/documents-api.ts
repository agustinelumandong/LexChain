import type {
  DocumentListItem,
  DocumentDetail,
  DocumentUploadAcceptedResponse,
  RenameDocumentResponse,
} from '@/services/api/documents.api';

export const MOCK_DOCUMENT_LIST: DocumentListItem[] = [
  {
    id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
    file_name: 'DepEd Memorandum No. 028, s. 2026',
    content_type: 'application/pdf',
    status: 'COMPLETED',
    created_at: '2026-05-08T18:03:03.282234Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    file_name: 'Lease Agreement - Rivera Holdings.pdf',
    content_type: 'application/pdf',
    status: 'COMPLETED',
    created_at: '2026-05-22T09:15:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    file_name: 'Power of Attorney - Martinez Family.pdf',
    content_type: 'application/pdf',
    status: 'PROCESSING',
    created_at: '2026-04-15T11:00:00Z',
  },
];

export const MOCK_DOCUMENT_DETAIL: DocumentDetail = {
  document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
  file_name: 'DepEd Memorandum No. 028, s. 2026',
  content_type: 'application/pdf',
  status: 'COMPLETED',
  summary:
    'DepEd Memorandum No. 028, s. 2026, issued by the Department of Education of the Republic of the Philippines on May 6, 2026, provides guidelines for the Basic Education Information System (BEIS) data collection and validation for school year 2025-2026. It directs public and private elementary and secondary schools, including state/local universities and colleges offering basic education, to update school information in BEIS from May 7 to June 15, 2026.',
  labels: [
    'Memorandum',
    'DepEd Memorandum',
    'Government Issuance',
    'Guidelines',
    'Basic Education Information System',
    'BEIS',
    'Data Collection',
    'Data Validation',
    'Education',
  ],
  entities: [
    { type: 'ORG', value: 'Department of Education' },
    { type: 'ORG', value: 'Republic of the Philippines' },
    { type: 'DATE', value: 'May 6, 2026' },
    { type: 'DATE', value: 'May 7, 2026' },
    { type: 'DATE', value: 'June 15, 2026' },
    { type: 'DATE', value: 'School Year 2025-2026' },
    { type: 'DATE', value: 'DepEd Order No. 027, s. 2019' },
    { type: 'DATE', value: 'DepEd Memorandum No. 031, s. 2025' },
    { type: 'URL', value: 'https://support.lis.deped.gov.ph/support/' },
    { type: 'DOCUMENT_NUMBER', value: 'DepEd Memorandum No. 028, s. 2026' },
    { type: 'DOCUMENT_NUMBER', value: 'DepEd Order No. 027, s. 2019' },
    { type: 'DOCUMENT_NUMBER', value: 'DepEd Memorandum No. 031, s. 2025' },
    { type: 'LOCATION', value: 'DepEd Complex, Meralco Avenue, Pasig City 1600' },
  ],
  risk_flags: [
    {
      clause:
        'School heads are responsible for ensuring the integrity and accuracy of the data reported by their respective schools. Failure to do so may result in administrative cases being filed against them.',
      severity: 'medium',
    },
  ],
  created_at: '2026-05-08T18:03:03.282234Z',
};

export const MOCK_DOCUMENT_DETAIL_PROCESSING: DocumentDetail = {
  document_id: '550e8400-e29b-41d4-a716-446655440003',
  file_name: 'Power of Attorney - Martinez Family.pdf',
  content_type: 'application/pdf',
  status: 'PROCESSING',
  summary: null,
  labels: [],
  entities: [],
  risk_flags: [],
  created_at: '2026-04-15T11:00:00Z',
};

export const MOCK_DOCUMENT_DETAIL_QUEUED: DocumentDetail = {
  document_id: '550e8400-e29b-41d4-a716-446655440099',
  file_name: 'New Document.pdf',
  content_type: 'application/pdf',
  status: 'QUEUED',
  summary: null,
  labels: [],
  entities: [],
  risk_flags: [],
  created_at: '2026-05-09T10:00:00Z',
};

export const MOCK_UPLOAD_ACCEPTED: DocumentUploadAcceptedResponse = {
  document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
  status: 'QUEUED',
  message: 'Document accepted for processing',
};

export const MOCK_RENAME_RESPONSE: RenameDocumentResponse = {
  document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
  file_name: 'DepEd Memorandum No. 028, s. 2026',
  status: 'COMPLETED',
};

export const MOCK_DOCUMENT_NOT_FOUND_ERROR = {
  detail: [
    {
      loc: ['path', 'document_id'],
      msg: 'Document not found',
      type: 'value_error.document_not_found',
      input: '550e8400-e29b-41d4-a716-446655440999',
    },
  ],
};