const mockParticipantId = 'mock-user-1';
const mockIssuerId = 'mock-lawyer';

export type DemoIntegrityState = 'match' | 'mismatch' | 'not-recorded' | 'unavailable';

export type DemoAnchorStatus = 'pending' | 'confirmed' | 'failed';

export type DemoDocumentSnapshot = {
  id: string;
  document_id: string;
  text_hash: string;
  created_at: string;
};

export type DemoDocumentLifecycle = {
  lifecycle: 'draft' | 'finalized' | 'restored';
  document_hash: string | null;
  finalized_at: string | null;
  finalized_by: string | null;
  anchor_status: DemoAnchorStatus | null;
  snapshots: DemoDocumentSnapshot[];
};

type MockDocument = {
  id: string;
  document_id: string;
  document_number: number;
  file_name: string;
  storage_url: string;
  content_type: string;
  status: string;
  on_chain: boolean;
  is_latest: boolean;
  summary: string;
  labels: string[];
  entities: Array<Record<string, string>>;
  risk_flags: Array<Record<string, string>>;
  created_at: string;
  updated_at: string;
} & DemoDocumentLifecycle & {
  integrity_state: DemoIntegrityState;
};

type MockInvitation = {
  id: string;
  document_id: string;
  document_title: string;
  role: string;
  status: string;
  created_at: string;
};

type MockDocumentRequest = {
  id: string;
  requester_id: string;
  requester_email: string;
  requester_name: string;
  document_id: string;
  document_name: string | null;
  description: string;
  status: string;
  lawyer_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

type MockBook = {
  id: string;
  book_number: number;
  series_year: number;
  document_count: number;
  page_count: number;
  is_full: boolean;
  created_at: string;
  updated_at: string | null;
};

const issuerProfile = {
  email: 'jane.doe@lexchain.local',
  f_name: 'Jane',
  l_name: 'Doe',
  avatar: 'icon1',
  role: 'lawyer',
  mfa_enabled: false,
};

const participantProfile = {
  email: 'user@example.com',
  f_name: 'Alex',
  l_name: 'User',
  avatar: 'icon2',
  role: 'user',
  mfa_enabled: false,
};

let documents: MockDocument[] = [
  {
    id: 'mock-document-1',
    document_id: 'mock-document-1',
    document_number: 1001,
    file_name: 'Lease Agreement.pdf',
    storage_url: '/mock-documents/lease-agreement.pdf',
    content_type: 'application/pdf',
    status: 'anchored',
    on_chain: true,
    is_latest: true,
    summary: 'A sample residential lease agreement between the document owner and a tenant.',
    labels: ['lease', 'agreement'],
    entities: [{ party: 'Jane Doe' }, { party: 'Sample Tenant' }],
    risk_flags: [],
    created_at: '2026-07-10T09:00:00.000Z',
    updated_at: '2026-07-10T09:05:00.000Z',
    lifecycle: 'finalized',
    document_hash: 'a'.repeat(64),
    finalized_at: '2026-07-10T09:05:00.000Z',
    finalized_by: mockIssuerId,
    anchor_status: 'confirmed',
    snapshots: [{
      id: 'mock-snapshot-1',
      document_id: 'mock-document-1',
      text_hash: 'a'.repeat(64),
      created_at: '2026-07-10T09:05:00.000Z',
    }],
    integrity_state: 'match',
  },
  {
    id: 'mock-document-2',
    document_id: 'mock-document-2',
    document_number: 1002,
    file_name: 'Certificate of Employment.pdf',
    storage_url: '/mock-documents/certificate-of-employment.pdf',
    content_type: 'application/pdf',
    status: 'completed',
    on_chain: false,
    is_latest: true,
    summary: 'A sample certificate of employment issued to Jane Doe.',
    labels: ['certificate', 'employment'],
    entities: [{ employee: 'Jane Doe' }],
    risk_flags: [{ note: 'Awaiting document processing.' }],
    created_at: '2026-07-13T13:30:00.000Z',
    updated_at: '2026-07-13T13:30:00.000Z',
    lifecycle: 'draft',
    document_hash: null,
    finalized_at: null,
    finalized_by: null,
    anchor_status: null,
    snapshots: [],
    integrity_state: 'not-recorded',
  },
  {
    id: 'mock-document-3',
    document_id: 'mock-document-3',
    document_number: 1003,
    file_name: 'Restoration Review.pdf',
    storage_url: '/mock-documents/restoration-review.pdf',
    content_type: 'application/pdf',
    status: 'anchored',
    on_chain: true,
    is_latest: true,
    summary: 'A seeded document with a deliberately mismatched integrity result for restoration review.',
    labels: ['restoration', 'integrity'],
    entities: [{ party: 'Jane Doe' }],
    risk_flags: [{ note: 'Integrity mismatch detected.' }],
    created_at: '2026-07-15T10:00:00.000Z',
    updated_at: '2026-07-15T10:05:00.000Z',
    lifecycle: 'finalized',
    document_hash: 'b'.repeat(64),
    finalized_at: '2026-07-15T10:05:00.000Z',
    finalized_by: mockIssuerId,
    anchor_status: 'confirmed',
    snapshots: [{
      id: 'mock-snapshot-3',
      document_id: 'mock-document-3',
      text_hash: 'b'.repeat(64),
      created_at: '2026-07-15T10:05:00.000Z',
    }],
    integrity_state: 'mismatch',
  },
  {
    id: 'mock-document-4',
    document_id: 'mock-document-4',
    document_number: 1004,
    file_name: 'Participant Shared Draft.pdf',
    storage_url: '/mock-documents/participant-shared-draft.pdf',
    content_type: 'application/pdf',
    status: 'completed',
    on_chain: false,
    is_latest: true,
    summary: 'A completed draft shared with the document participant for read-only review.',
    labels: ['shared', 'participant'],
    entities: [{ party: 'Alex User' }],
    risk_flags: [],
    created_at: '2026-07-18T09:00:00.000Z',
    updated_at: '2026-07-18T09:00:00.000Z',
    lifecycle: 'draft',
    document_hash: null,
    finalized_at: null,
    finalized_by: null,
    anchor_status: null,
    snapshots: [],
    integrity_state: 'not-recorded',
  },
];

let documentAudits: Array<Record<string, unknown>> = [];

let notifications = [
  {
    id: 'mock-notification-1',
    title: 'Document anchored',
    body: 'Lease Agreement.pdf is now recorded on-chain.',
    is_read: false,
    created_at: '2026-07-10T09:05:00.000Z',
  },
  {
    id: 'mock-notification-2',
    title: 'Document processing',
    body: 'Certificate of Employment.pdf is being processed.',
    is_read: false,
    created_at: '2026-07-13T13:30:00.000Z',
  },
];

let invitations: MockInvitation[] = [
  {
    id: 'mock-invitation-1',
    document_id: 'mock-document-1',
    document_title: 'Lease Agreement.pdf',
    role: 'viewer',
    status: 'pending',
    created_at: '2026-07-12T10:00:00.000Z',
  },
];

let documentRequests: MockDocumentRequest[] = [
  {
    id: 'mock-request-1',
    requester_id: mockParticipantId,
    requester_email: participantProfile.email,
    requester_name: `${participantProfile.f_name} ${participantProfile.l_name}`,
    document_id: 'mock-document-1',
    document_name: 'Lease Agreement.pdf',
    description: 'I need an e-copy for my records.',
    status: 'pending',
    lawyer_id: mockIssuerId,
    rejection_reason: null,
    created_at: '2026-07-11T10:00:00.000Z',
    updated_at: '2026-07-11T10:00:00.000Z',
  },
  {
    id: 'mock-request-2',
    requester_id: mockParticipantId,
    requester_email: participantProfile.email,
    requester_name: `${participantProfile.f_name} ${participantProfile.l_name}`,
    document_id: 'mock-document-2',
    document_name: 'Certificate of Employment.pdf',
    description: 'Please send the completed certificate.',
    status: 'approved',
    lawyer_id: mockIssuerId,
    rejection_reason: null,
    created_at: '2026-07-09T10:00:00.000Z',
    updated_at: '2026-07-10T10:00:00.000Z',
  },
];

let books: MockBook[] = [
  {
    id: 'mock-book-1',
    book_number: 1,
    series_year: 2026,
    document_count: 2,
    page_count: 2,
    is_full: false,
    created_at: '2026-07-01T08:00:00.000Z',
    updated_at: null,
  },
];

const sharedDocumentIds = new Set(['mock-document-4']);

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function error(message: string, status: number) {
  return json({ message }, status);
}

function documentFor(id: string) {
  return documents.find((document) => document.id === id);
}

function deterministicHash(value: string) {
  return value.split('').map((character) => character.charCodeAt(0).toString(16)).join('').padEnd(64, '0').slice(0, 64);
}

function documentAuditsFor(document: MockDocument) {
  return [
    {
      id: `mock-audit-${document.id}`,
      document_id: document.id,
      user_id: mockIssuerId,
      action: 'document_created',
      details: { source: 'mock portal' },
      created_at: document.created_at,
    },
    ...documentAudits.filter((audit) => audit.document_id === document.id),
  ];
}

function canAccessDocument(token: string | undefined, document: MockDocument) {
  return !isMockParticipant(token) || sharedDocumentIds.has(document.id);
}

function documentPaths(path: string) {
  return path.match(/^\/documents\/([^/]+)(?:\/(parties|versions|audit-logs))?\/?$/);
}

function pathname(path: string) {
  try {
    return new URL(path, 'https://mock.lexchain.local').pathname;
  } catch {
    return path;
  }
}

export function isMockMode() {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.USE_MOCK_API === 'true';
}

export function isMockPortalToken(token: string) {
  return token === 'mock-token:mock-user' || token === 'mock-token:mock-lawyer';
}

function profileForToken(token?: string) {
  return token === 'mock-token:mock-user' ? participantProfile : issuerProfile;
}

function isMockParticipant(token?: string) {
  return token === 'mock-token:mock-user';
}

function isMockIssuer(token?: string) {
  return token === 'mock-token:mock-lawyer';
}

function hasMockIssuerAccess(token?: string) {
  return !token || isMockIssuer(token);
}

function requestList(requests: MockDocumentRequest[]) {
  return { requests, total: requests.length };
}

export function mockPortalGet(path: string, token?: string): Response {
  if (token && !isMockPortalToken(token)) return error('Not authenticated', 401);
  const requestPathname = pathname(path);
  const searchParams = new URL(path, 'https://mock.lexchain.local').searchParams;
  if (path === '/users/' || path === '/users') return json(profileForToken(token));
  if (requestPathname === '/documents' || requestPathname === '/documents/') {
    return json(isMockParticipant(token) ? documents.filter((document) => sharedDocumentIds.has(document.id)) : documents);
  }
  if (requestPathname === '/books' || requestPathname === '/books/') {
    if (!hasMockIssuerAccess(token)) return error('Document Issuer access required', 403);
    return json(books);
  }
  if (path === '/notifications/' || path === '/notifications') {
    return json({ notifications, total: notifications.length });
  }
  if (path === '/notifications/unread-count') {
    return json({ unread: notifications.filter((notification) => !notification.is_read).length });
  }
  if (requestPathname === '/documents/invitations') {
    if (!isMockParticipant(token)) return error('Document Participant access required', 403);
    return json(invitations.filter((invitation) => invitation.status === 'pending'));
  }
  if (requestPathname === '/requests/my') {
    if (!isMockParticipant(token)) return error('Document Participant access required', 403);
    return json(requestList(documentRequests.filter((request) => request.requester_id === mockParticipantId)));
  }
  if (requestPathname === '/requests') {
    if (!isMockIssuer(token)) return error('Document Issuer access required', 403);
    const status = searchParams.get('status');
    const filtered = status ? documentRequests.filter((request) => request.status === status) : documentRequests;
    return json(requestList(filtered));
  }

  const snapshotsMatch = requestPathname.match(/^\/documents\/([^/]+)\/snapshots\/?$/);
  if (snapshotsMatch) {
    const document = documentFor(snapshotsMatch[1]);
    if (!document) return error('Document not found', 404);
    if (!canAccessDocument(token, document)) return error('Document access required', 403);
    return json(document.snapshots);
  }

  const documentMatch = documentPaths(path);
  if (documentMatch) {
    const [, id, detail] = documentMatch;
    const document = documentFor(id);
    if (!document) return error('Document not found', 404);
    if (!canAccessDocument(token, document)) return error('Document access required', 403);
    if (!detail) return json(document);
    if (detail === 'parties') {
      return json({
        document_id: document.id,
        issuer: { id: mockIssuerId, f_name: issuerProfile.f_name, l_name: issuerProfile.l_name, email: issuerProfile.email, role: 'issuer' },
        parties: [{ id: 'mock-party-1', f_name: 'Sample', l_name: 'Tenant', email: 'tenant@example.test', role: 'tenant' }],
      });
    }
    if (detail === 'versions') {
      return json({ current_document_id: document.id, versions: [document], total_version: 1 });
    }
    return json(documentAuditsFor(document));
  }

  const blockchainMatch = path.match(/^\/blockchain\/verify\/([^/]+)\/?$/);
  if (blockchainMatch) {
    const document = documentFor(blockchainMatch[1]);
    if (!document || !document.on_chain) return error('On-chain record not found', 404);
    return json({
      document_id: document.id,
      onchain_document_id: `chain-${document.id}`,
      data_hash: '0xmockdatahash',
      tx_hash: '0xmocktransactionhash',
      onchain_timestamp: Math.floor(new Date(document.updated_at).getTime() / 1000),
      issued_by: '0xMockIssuer',
      verified_at: new Date().toISOString(),
      transacttion_link: 'https://example.test/mock-transaction',
      is_verified: document.integrity_state !== 'mismatch',
    });
  }

  return error('Mock endpoint not found', 404);
}

async function jsonBody(request: Request) {
  return request.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

async function uploadDocument(request: Request, path: string) {
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.pdf')) {
    return error('A PDF file is required', 400);
  }

  const now = new Date().toISOString();
  const requestUrl = new URL(path, 'https://mock.lexchain.local');
  const fileName = requestUrl.searchParams.get('file_name')?.trim();
  if (!fileName || /[\u0000-\u001F\u007F]/.test(fileName)) return error('A valid file name is required', 400);
  const bookId = requestUrl.searchParams.get('book_id');
  const book = books.find((candidate) => candidate.id === bookId && !candidate.is_full);
  if (!book) return error('An active book is required', 400);
  const id = `mock-document-${Date.now()}`;
  const document: MockDocument = {
    id,
    document_id: id,
    document_number: 1000 + documents.length + 1,
    file_name: fileName,
    storage_url: `/mock-documents/${encodeURIComponent(fileName)}`,
    content_type: file.type || 'application/pdf',
    status: 'completed',
    on_chain: false,
    is_latest: true,
    summary: 'A locally uploaded mock document.',
    labels: ['uploaded'],
    entities: [],
    risk_flags: [],
    created_at: now,
    updated_at: now,
    lifecycle: 'draft',
    document_hash: null,
    finalized_at: null,
    finalized_by: null,
    anchor_status: null,
    snapshots: [],
    integrity_state: 'not-recorded',
  };
  documents = [document, ...documents];
  books = books.map((candidate) => candidate.id === book.id ? {
    ...candidate,
    document_count: candidate.document_count + 1,
    page_count: candidate.page_count + 1,
    updated_at: now,
  } : candidate);
  notifications = [{
    id: `mock-notification-${Date.now()}`,
    title: 'Document uploaded',
    body: `${fileName} is ready to review.`,
    is_read: false,
    created_at: now,
  }, ...notifications];
  return json({ document_id: id, status: document.status }, 201);
}

async function createBook(request: Request) {
  const body = await jsonBody(request);
  const bookNumber = body?.book_number;
  const seriesYear = body?.series_year;
  if (typeof bookNumber !== 'number' || !Number.isInteger(bookNumber) || typeof seriesYear !== 'number' || !Number.isInteger(seriesYear)) {
    return error('Book number and series year are required', 400);
  }
  if (bookNumber < 1 || bookNumber > 1000 || seriesYear < 2000) {
    return error('Book number or series year is invalid', 400);
  }
  if (books.some((book) => book.book_number === bookNumber && book.series_year === seriesYear)) {
    return error('Book already exists', 400);
  }
  const now = new Date().toISOString();
  const book: MockBook = {
    id: `mock-book-${Date.now()}`,
    book_number: bookNumber,
    series_year: seriesYear,
    document_count: 0,
    page_count: 0,
    is_full: false,
    created_at: now,
    updated_at: null,
  };
  books = [...books, book];
  return json(book, 201);
}

async function searchDocuments(request: Request) {
  const body = await jsonBody(request);
  const query = typeof body?.query === 'string' ? body.query.trim() : '';
  if (!query) return error('Search query is required', 400);
  const normalized = query.toLowerCase();
  const results = documents
    .filter((document) => `${document.file_name} ${document.summary} ${document.labels.join(' ')}`.toLowerCase().includes(normalized))
    .map((document) => ({
      chunk_id: `mock-search-${document.id}`,
      document_id: document.id,
      text: document.summary,
      score: 0.95,
    }));
  return json({ query, results });
}

async function askDocument(id: string, request: Request) {
  const document = documentFor(id);
  if (!document) return error('Document not found', 404);
  const body = await jsonBody(request);
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  if (!question) return error('A question is required', 400);
  return json({ answer: `Mock answer for ${document.file_name}: ${document.summary}` });
}

export async function mockPortalMutate(method: 'POST' | 'PATCH', path: string, request: Request, token?: string): Promise<Response> {
  if (token && !isMockPortalToken(token)) return error('Not authenticated', 401);
  const requestPathname = pathname(path);
  if (method === 'POST' && (requestPathname === '/documents/upload' || requestPathname === '/documents/upload/')) {
    if (!hasMockIssuerAccess(token)) return error('Document Issuer access required', 403);
    return uploadDocument(request, path);
  }
  if (method === 'POST' && (requestPathname === '/books' || requestPathname === '/books/')) {
    if (!hasMockIssuerAccess(token)) return error('Document Issuer access required', 403);
    return createBook(request);
  }

  const finalizeMatch = requestPathname.match(/^\/documents\/([^/]+)\/finalize\/?$/);
  if (method === 'POST' && finalizeMatch) {
    if (!hasMockIssuerAccess(token)) return error('Document Issuer access required', 403);
    const document = documentFor(finalizeMatch[1]);
    if (!document) return error('Document not found', 404);
    if (document.lifecycle === 'finalized') return json(document);
    if (document.status.trim().toUpperCase() !== 'COMPLETED' || document.lifecycle !== 'draft') {
      return error('Document cannot be finalized', 400);
    }
    const now = new Date().toISOString();
    const documentHash = deterministicHash(document.id);
    const finalizedDocument: MockDocument = {
      ...document,
      lifecycle: 'finalized',
      document_hash: documentHash,
      finalized_at: now,
      finalized_by: mockIssuerId,
      anchor_status: 'confirmed',
      snapshots: document.snapshots.length ? document.snapshots : [{
        id: `mock-snapshot-${document.id}`,
        document_id: document.id,
        text_hash: documentHash,
        created_at: now,
      }],
      integrity_state: 'match',
      updated_at: now,
    };
    documents = documents.map((item) => item.id === document.id ? finalizedDocument : item);
    documentAudits = [...documentAudits, {
      id: `mock-audit-finalized-${document.id}`,
      document_id: document.id,
      user_id: mockIssuerId,
      action: 'document_finalized',
      details: { document_hash: documentHash },
      created_at: now,
    }];
    return json(finalizedDocument);
  }

  const restoreMatch = requestPathname.match(/^\/documents\/([^/]+)\/snapshots\/([^/]+)\/restore\/?$/);
  if (method === 'POST' && restoreMatch) {
    if (!hasMockIssuerAccess(token)) return error('Document Issuer access required', 403);
    const [, documentId, snapshotId] = restoreMatch;
    const document = documentFor(documentId);
    if (!document) return error('Document not found', 404);
    const snapshot = document.snapshots.find((item) => item.id === snapshotId);
    if (!snapshot) return error('Snapshot not found', 404);
    const body = await jsonBody(request);
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
    if (!reason) return error('A restoration reason is required', 400);
    const now = new Date().toISOString();
    const restoredDocument: MockDocument = {
      ...document,
      lifecycle: 'restored',
      document_hash: snapshot.text_hash,
      integrity_state: 'match',
      updated_at: now,
    };
    documents = documents.map((item) => item.id === document.id ? restoredDocument : item);
    documentAudits = [...documentAudits, {
      id: `mock-audit-restored-${document.id}-${Date.now()}`,
      document_id: document.id,
      user_id: mockIssuerId,
      action: 'document_restored',
      details: { snapshot_id: snapshot.id, reason },
      created_at: now,
    }];
    return json(restoredDocument);
  }
  if (method === 'POST' && path === '/search') return searchDocuments(request);

  const askMatch = path.match(/^\/documents\/([^/]+)\/ask\/?$/);
  if (method === 'POST' && askMatch) return askDocument(askMatch[1], request);

  const invitationMatch = requestPathname.match(/^\/documents\/([^/]+)\/parties\/(accept|reject)$/);
  if (method === 'POST' && invitationMatch) {
    if (!isMockParticipant(token)) return error('Document Participant access required', 403);
    const [, documentId] = invitationMatch;
    const invitation = invitations.find((item) => item.document_id === documentId && item.status === 'pending');
    if (!invitation) return error('Invitation not found', 404);
    invitations = invitations.filter((item) => item.id !== invitation.id);
    sharedDocumentIds.add(documentId);
    return new Response(null, { status: 204 });
  }

  const reviewMatch = requestPathname.match(/^\/requests\/([^/]+)\/review$/);
  if (method === 'PATCH' && reviewMatch) {
    if (!isMockIssuer(token)) return error('Document Issuer access required', 403);
    const body = await jsonBody(request);
    const action = body?.action;
    const rejectionReason = typeof body?.rejection_reason === 'string' ? body.rejection_reason.trim() : '';
    if (action !== 'approve' && action !== 'reject') return error('Review action must be approve or reject', 400);
    if (action === 'reject' && !rejectionReason) return error('A rejection reason is required', 400);
    const requestId = reviewMatch[1];
    const existingRequest = documentRequests.find((item) => item.id === requestId);
    if (!existingRequest) return error('Request not found', 404);
    if (existingRequest.status !== 'pending') return error('Request has already been reviewed', 400);
    const reviewedRequest: MockDocumentRequest = {
      ...existingRequest,
      status: action === 'approve' ? 'approved' : 'rejected',
      rejection_reason: action === 'reject' ? rejectionReason : null,
      updated_at: new Date().toISOString(),
    };
    documentRequests = documentRequests.map((item) => item.id === requestId ? reviewedRequest : item);
    return json(reviewedRequest);
  }

  if (method === 'PATCH' && path === '/notifications/read-all') {
    notifications = notifications.map((notification) => ({ ...notification, is_read: true }));
    return new Response(null, { status: 204 });
  }

  const notificationMatch = path.match(/^\/notifications\/([^/]+)\/read\/?$/);
  if (method === 'PATCH' && notificationMatch) {
    const found = notifications.some((notification) => notification.id === notificationMatch[1]);
    if (!found) return error('Notification not found', 404);
    notifications = notifications.map((notification) => (
      notification.id === notificationMatch[1] ? { ...notification, is_read: true } : notification
    ));
    return new Response(null, { status: 204 });
  }

  return error('Mock endpoint not found', 404);
}
