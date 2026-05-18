/**
 * Mock document data matching OpenAPI spec response format.
 *
 * API Schemas:
 * - DocumentUploadResponse (list endpoint): id, file_name, content_type, status, created_at
 * - DocumentResponse (detail endpoint): document_id, file_name, content_type, status,
 *   summary, labels, entities, risk_flags, created_at
 *
 * Note: Additional UI fields (preview, verify, whitelist) are included for development
 * but would need to be fetched separately in production.
 */
import type { MockDocument } from '@/types';

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    // API field: id (uuid) - maps to MockDocument.id
    id: '550e8400-e29b-41d4-a716-446655440001',
    // API field: file_name - maps to MockDocument.title
    title: 'Deed of Sale - Santos & Dela Cruz.pdf',
    // API field: summary (from DocumentResponse) - LLM-generated summary
    summary:
      'Land sale agreement between Mario Santos and Juan Dela Cruz for property located at 123 Makati Avenue. Sale price: PHP 5,500,000. Payment terms: PHP 2,750,000 upfront, remainder in 12 monthly installments.',
    // API field: created_at (date-time) - maps to MockDocument.date
    date: '2026-06-10T14:30:00Z',
    // API field: content_type - maps to MockDocument.documentType
    documentType: 'deed-of-sale',
    // API field: status (COMPLETED/PROCESSING/QUEUED/FAILED)
    status: 'COMPLETED',
    // UI field: Document preview data (not in API response - would be separate endpoint)
    preview: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Deed of Sale - Santos & Dela Cruz',
      summaryRows: [
        { label: 'Reference', value: 'REF-2026-1002' },
        { label: 'Parties', value: 'Mario Santos • Juan Dela Cruz' },
        { label: 'Files uploaded', value: '3 files' },
      ],
      summary:
        'Land sale file with attachments, extracted clauses, and context for legal review.',
      sections: [
        {
          title: 'Core fields',
          rows: [
            { label: 'Document type', value: 'Deed of Sale' },
            { label: 'Effective date', value: '2026-06-10' },
            { label: 'Property address', value: '123 Makati Avenue, Metro Manila' },
            { label: 'Sale price', value: 'PHP 5,500,000' },
          ],
        },
        {
          title: 'Parties',
          rows: [
            { label: 'Seller', value: 'Mario Santos' },
            { label: 'Buyer', value: 'Juan Dela Cruz' },
          ],
        },
        {
          title: 'Payment terms',
          rows: [
            { label: 'Downpayment', value: 'PHP 2,750,000 (50%)' },
            { label: 'Balance', value: 'PHP 2,750,000 (12 monthly installments)' },
          ],
        },
        {
          title: 'Clauses',
          body: 'Payment, transfer, warranty, indemnification, dispute resolution.',
        },
        {
          title: 'Obligations',
          rows: [
            { label: 'Seller', value: 'Transfer clean title, warrant against encumbrances' },
            { label: 'Buyer', value: 'Release payment per schedule, accept transfer' },
          ],
        },
        {
          title: 'Attachments',
          rows: [
            { label: 'Files', value: 'SaleDeed.pdf + 2 attachments' },
            { label: 'Tax clearance', value: 'Included' },
            { label: 'Title deed', value: 'Copy on file' },
          ],
        },
        {
          title: 'Risk flags',
          rows: [
            { label: 'Missing fields', value: 'None' },
            { label: 'Verification status', value: 'Passed' },
          ],
        },
      ],
      confidenceLabel: 'Confidence',
      confidenceValue: 'Verified',
      whitelist: {
        allowedCountLabel: '3 allowed wallets/users',
        helperText:
          'Whitelist rules apply to this document only. Manage allowed access before sharing.',
      },
    },
    // UI field: Verification data (not in API response - would be separate endpoint)
    verify: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Deed of Sale - Santos & Dela Cruz',
      summaryRows: [
        { label: 'Reference', value: 'REF-2026-1002' },
        { label: 'Parties', value: 'Mario Santos • Juan Dela Cruz' },
        { label: 'Date', value: '2026-06-10' },
        { label: 'Topical agenda', value: 'Ownership transfer' },
      ],
      summary:
        'Verification compares extracted record and uploaded file hash against anchored reference on blockchain.',
      steps: [
        { label: 'Upload verification', status: 'done' },
        { label: 'Document scanning', status: 'done' },
        { label: 'Hash comparison', status: 'done' },
        { label: 'Blockchain anchor', status: 'done' },
      ],
      offChainHash: '0xa13f8d9e2b7c4f5d6e8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
      onChainHash: '0xa13f8d9e2b7c4f5d6e8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
      integrityStatus: 'Match',
    },
    // UI field: Whitelist management (not in API response - would be separate endpoint)
    whitelist: {
      grants: [
        {
          id: 'cruz',
          name: 'Atty. Maria Cruz',
          email: 'cruz@lexchain.app',
          accessLabel: 'Verify access',
          actionLabel: 'Verify',
        },
        {
          id: 'juan-d',
          name: 'Juan Dela Cruz',
          email: 'juan.d@lexchain.app',
          accessLabel: 'View access',
          actionLabel: 'View',
        },
        {
          id: 'santos-family',
          name: 'Santos Family Trust',
          email: 'trust@santos.ph',
          accessLabel: 'View access',
          actionLabel: 'View',
        },
      ],
      searchResults: [
        { id: 'juan-dela-cruz', name: 'Juan Dela Cruz', email: 'juan@lexchain.app' },
        { id: 'mario-santos', name: 'Mario Santos', email: 'mario@lexchain.app' },
      ],
    },
  },
  {
    // API field: id (uuid)
    id: '550e8400-e29b-41d4-a716-446655440002',
    // API field: file_name
    title: 'Lease Agreement - Rivera Holdings.pdf',
    // API field: summary
    summary:
      'Commercial lease contract between Rivera Holdings Inc. and LCN Realty Corp. Property: Office Space Unit 5B, 88 Business Park, Makati. Term: 3 years. Monthly rent: PHP 150,000 + PHP 30,000 VAT.',
    // API field: created_at
    date: '2026-05-22T09:15:00Z',
    // API field: content_type
    documentType: 'lease-contract',
    // API field: status
    status: 'COMPLETED',
    // UI field: Document preview
    preview: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Lease Agreement - Rivera Holdings',
      summaryRows: [
        { label: 'Reference', value: 'LEASE-2026-44' },
        { label: 'Parties', value: 'Rivera Holdings Inc. • LCN Realty Corp.' },
        { label: 'Files uploaded', value: '2 files' },
      ],
      summary:
        'Commercial lease packet with schedule details, obligations, and supporting attachments.',
      sections: [
        {
          title: 'Core fields',
          rows: [
            { label: 'Document type', value: 'Lease Contract' },
            { label: 'Effective date', value: '2026-05-22' },
            { label: 'Property', value: 'Unit 5B, 88 Business Park, Makati' },
            { label: 'Term', value: '3 years (renewable)' },
          ],
        },
        {
          title: 'Financial terms',
          rows: [
            { label: 'Monthly rent', value: 'PHP 150,000 + VAT' },
            { label: 'Security deposit', value: 'PHP 450,000 (3 months)' },
            { label: 'Payment due', value: '5th of each month' },
          ],
        },
        {
          title: 'Clauses',
          body: 'Occupancy, renewal, maintenance, termination, subleasing, utilities.',
        },
        {
          title: 'Obligations',
          rows: [
            { label: 'Lessor', value: 'Maintain premises, provide HVAC, building security' },
            { label: 'Lessee', value: 'Monthly rental payment, maintain interior, pay utilities' },
          ],
        },
        {
          title: 'Attachments',
          rows: [
            { label: 'Files', value: 'Lease.pdf + 1 attachment' },
            { label: 'Floor plan', value: 'Included' },
          ],
        },
        {
          title: 'Risk flags',
          rows: [
            { label: 'Missing fields', value: 'Review stamp required' },
            { label: 'Verification status', value: 'Needs review' },
          ],
        },
      ],
      confidenceLabel: 'Confidence',
      confidenceValue: 'Review needed',
      whitelist: {
        allowedCountLabel: '1 wallet pending review',
        helperText:
          'Whitelist rules apply to this document only. Update access before release.',
      },
    },
    // UI field: Verification data
    verify: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Lease Agreement - Rivera Holdings',
      summaryRows: [
        { label: 'Reference', value: 'LEASE-2026-44' },
        { label: 'Parties', value: 'Rivera Holdings Inc. • LCN Realty Corp.' },
        { label: 'Date', value: '2026-05-22' },
        { label: 'Topical agenda', value: 'Lease and occupancy' },
      ],
      summary:
        'Verification found a mismatch between the extracted record and the latest uploaded support file. Manual review required.',
      steps: [
        { label: 'Upload verification', status: 'done' },
        { label: 'Document scanning', status: 'done' },
        { label: 'Hash comparison', status: 'done' },
        { label: 'Blockchain anchor', status: 'pending' },
      ],
      offChainHash: '0xc77f3a1b2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      onChainHash: '0xe91d2b3c4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
      integrityStatus: 'Review',
    },
    // UI field: Whitelist management
    whitelist: {
      grants: [
        {
          id: 'rivera-counsel',
          name: 'Atty. Roberto Rivera',
          email: 'rivera@lexchain.app',
          accessLabel: 'Verify access',
          actionLabel: 'Verify',
        },
        {
          id: 'lcn-owner',
          name: 'LCN Realty Owner',
          email: 'owner@lcn.app',
          accessLabel: 'View access',
          actionLabel: 'View',
        },
      ],
      searchResults: [
        { id: 'marco-rivera', name: 'Marco Rivera', email: 'marco@lexchain.app' },
        { id: 'lcn-admin', name: 'LCN Admin', email: 'admin@lexchain.app' },
      ],
    },
  },
  {
    // Additional document for variety
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Power of Attorney - Martinez Family.pdf',
    summary:
      'Special Power of Attorney authorizing Maria Martinez to act on behalf of the Martinez Family Trust in all real estate transactions, including sale, lease, and property management.',
    date: '2026-04-15T11:00:00Z',
    documentType: 'power-of-attorney',
    status: 'PROCESSING',
    preview: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Power of Attorney - Martinez Family',
      summaryRows: [
        { label: 'Reference', value: 'POA-2026-003' },
        { label: 'Principal', value: 'Martinez Family Trust' },
        { label: 'Agent', value: 'Maria Martinez' },
        { label: 'Files uploaded', value: '1 file' },
      ],
      summary: 'Special Power of Attorney for real estate transactions.',
      sections: [
        {
          title: 'Core fields',
          rows: [
            { label: 'Document type', value: 'Special Power of Attorney' },
            { label: 'Effective date', value: '2026-04-15' },
            { label: 'Expiration', value: '2 years from effective date' },
          ],
        },
        {
          title: 'Powers granted',
          body: 'Sell, lease, mortgage, collect rent, manage properties, execute documents.',
        },
        {
          title: 'Risk flags',
          rows: [
            { label: 'Status', value: 'Processing - AI analysis in progress' },
          ],
        },
      ],
      confidenceLabel: 'Confidence',
      confidenceValue: 'Processing',
      whitelist: {
        allowedCountLabel: '0 allowed',
        helperText: 'Add access rules before sharing this document.',
      },
    },
    verify: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Power of Attorney - Martinez Family',
      summaryRows: [
        { label: 'Reference', value: 'POA-2026-003' },
        { label: 'Principal', value: 'Martinez Family Trust' },
        { label: 'Agent', value: 'Maria Martinez' },
        { label: 'Topical agenda', value: 'Authorization for real estate' },
      ],
      summary: 'Verification pending - document still being processed.',
      steps: [
        { label: 'Upload verification', status: 'done' },
        { label: 'Document scanning', status: 'done' },
        { label: 'Hash comparison', status: 'pending' },
        { label: 'Blockchain anchor', status: 'pending' },
      ],
      offChainHash: '',
      onChainHash: '',
      integrityStatus: 'Pending',
    },
    whitelist: {
      grants: [],
      searchResults: [
        { id: 'maria-martinez', name: 'Maria Martinez', email: 'maria@lexchain.app' },
        { id: 'martinez-trust', name: 'Martinez Family Trust', email: 'trust@martinez.ph' },
      ],
    },
  },
];
