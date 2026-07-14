const mockUserId = 'mock-user-1';

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
};

const profile = {
  email: 'jane.doe@lexchain.local',
  f_name: 'Jane',
  l_name: 'Doe',
  avatar: 'icon1',
  role: 'lawyer',
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
  },
  {
    id: 'mock-document-2',
    document_id: 'mock-document-2',
    document_number: 1002,
    file_name: 'Certificate of Employment.pdf',
    storage_url: '/mock-documents/certificate-of-employment.pdf',
    content_type: 'application/pdf',
    status: 'processing',
    on_chain: false,
    is_latest: true,
    summary: 'A sample certificate of employment issued to Jane Doe.',
    labels: ['certificate', 'employment'],
    entities: [{ employee: 'Jane Doe' }],
    risk_flags: [{ note: 'Awaiting document processing.' }],
    created_at: '2026-07-13T13:30:00.000Z',
    updated_at: '2026-07-13T13:30:00.000Z',
  },
];

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

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function error(message: string, status: number) {
  return json({ message }, status);
}

function documentFor(id: string) {
  return documents.find((document) => document.id === id);
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
  return token.startsWith('mock-token:');
}

export function mockPortalGet(path: string): Response {
  if (path === '/users/' || path === '/users') return json(profile);
  if (path === '/documents/' || path === '/documents') return json(documents);
  if (path === '/notifications/' || path === '/notifications') {
    return json({ notifications, total: notifications.length });
  }
  if (path === '/notifications/unread-count') {
    return json({ unread: notifications.filter((notification) => !notification.is_read).length });
  }

  const documentMatch = documentPaths(path);
  if (documentMatch) {
    const [, id, detail] = documentMatch;
    const document = documentFor(id);
    if (!document) return error('Document not found', 404);
    if (!detail) return json(document);
    if (detail === 'parties') {
      return json({
        document_id: document.id,
        issuer: { id: mockUserId, f_name: profile.f_name, l_name: profile.l_name, email: profile.email, role: 'issuer' },
        parties: [{ id: 'mock-party-1', f_name: 'Sample', l_name: 'Tenant', email: 'tenant@example.test', role: 'tenant' }],
      });
    }
    if (detail === 'versions') {
      return json({ current_document_id: document.id, versions: [document], total_version: 1 });
    }
    return json([
      {
        id: `mock-audit-${document.id}`,
        document_id: document.id,
        user_id: mockUserId,
        action: 'document_created',
        details: { source: 'mock portal' },
        created_at: document.created_at,
      },
    ]);
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
      is_verified: true,
    });
  }

  return error('Mock endpoint not found', 404);
}

async function jsonBody(request: Request) {
  return request.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

async function uploadDocument(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.pdf')) {
    return error('A PDF file is required', 400);
  }

  const now = new Date().toISOString();
  const id = `mock-document-${Date.now()}`;
  const document: MockDocument = {
    id,
    document_id: id,
    document_number: 1000 + documents.length + 1,
    file_name: file.name,
    storage_url: `/mock-documents/${encodeURIComponent(file.name)}`,
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
  };
  documents = [document, ...documents];
  notifications = [{
    id: `mock-notification-${Date.now()}`,
    title: 'Document uploaded',
    body: `${file.name} is ready to review.`,
    is_read: false,
    created_at: now,
  }, ...notifications];
  return json({ document_id: id, status: document.status }, 201);
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

export async function mockPortalMutate(method: 'POST' | 'PATCH', path: string, request: Request): Promise<Response> {
  const requestPathname = pathname(path);
  if (method === 'POST' && (requestPathname === '/documents/upload' || requestPathname === '/documents/upload/')) return uploadDocument(request);
  if (method === 'POST' && path === '/search') return searchDocuments(request);

  const askMatch = path.match(/^\/documents\/([^/]+)\/ask\/?$/);
  if (method === 'POST' && askMatch) return askDocument(askMatch[1], request);

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
