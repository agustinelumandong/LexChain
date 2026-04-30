import type { MockDocument } from '@/types';

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: '1002',
    title: 'Deed of Sale #1002',
    parties: 'Santos & Dela Cruz',
    date: '2026-06-10',
    documentType: 'deed-of-sale',
    status: 'verified',
    preview: {
      id: '1002',
      title: 'Deed of Sale #1002',
      summaryRows: [
        { label: 'Reference', value: 'REF-2026-1002' },
        { label: 'Parties', value: 'Santos • Dela Cruz' },
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
          ],
        },
        {
          title: 'Clauses',
          body: 'Payment, transfer, warranty.',
        },
        {
          title: 'Obligations',
          rows: [
            { label: 'Seller', value: 'Transfer title' },
            { label: 'Buyer', value: 'Release payment' },
          ],
        },
        {
          title: 'Attachments',
          rows: [{ label: 'Files', value: 'SaleDeed.pdf + 2' }],
        },
        {
          title: 'Risk flags',
          rows: [{ label: 'Missing fields', value: 'None' }],
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
    verify: {
      id: '1002',
      title: 'Deed of Sale #1002',
      summaryRows: [
        { label: 'Reference', value: 'REF-2026-1002' },
        { label: 'Parties', value: 'Santos • Dela Cruz' },
        { label: 'Date', value: '2026-06-10' },
        { label: 'Topical agenda', value: 'Ownership transfer' },
      ],
      summary:
        'Verification compares extracted record and uploaded file hash against anchored reference.',
      steps: [
        { label: 'Uploaded Docs Verifying', status: 'done' },
        { label: 'Docs Scanning', status: 'verifying' },
        { label: 'Generating Summary', status: 'pending' },
        { label: 'Anchor Pending', status: 'pending' },
      ],
      offChainHash: '0xA13...9F2',
      onChainHash: '0xA13...9F2',
      integrityStatus: 'Match',
    },
    whitelist: {
      grants: [
        {
          id: 'cruz',
          name: 'Atty. Cruz',
          email: 'cruz@lexchain.app',
          accessLabel: 'Verify access',
          actionLabel: 'Verify',
        },
        {
          id: 'juan-d',
          name: 'Juan D.',
          email: 'juan.d@lexchain.app',
          accessLabel: 'View access',
          actionLabel: 'View',
        },
      ],
      searchResults: [
        { id: 'juan-dela-cruz', name: 'Juan Dela Cruz', email: 'juan@lexchain.app' },
        { id: 'juan-santos', name: 'Juan Santos', email: 'owner@lexchain.app' },
      ],
    },
  },
  {
    id: '44',
    title: 'Lease Contract #44',
    parties: 'Rivera Holdings & LCN Realty',
    date: '2026-05-22',
    documentType: 'lease-contract',
    status: 'review-needed',
    preview: {
      id: '44',
      title: 'Lease Contract #44',
      summaryRows: [
        { label: 'Reference', value: 'LEASE-2026-44' },
        { label: 'Parties', value: 'Rivera Holdings • LCN Realty' },
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
          ],
        },
        {
          title: 'Clauses',
          body: 'Occupancy, renewal, maintenance.',
        },
        {
          title: 'Obligations',
          rows: [
            { label: 'Lessor', value: 'Maintain premises' },
            { label: 'Lessee', value: 'Monthly rental payment' },
          ],
        },
        {
          title: 'Attachments',
          rows: [{ label: 'Files', value: 'Lease.pdf + 1' }],
        },
        {
          title: 'Risk flags',
          rows: [{ label: 'Missing fields', value: 'Review stamp' }],
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
    verify: {
      id: '44',
      title: 'Lease Contract #44',
      summaryRows: [
        { label: 'Reference', value: 'LEASE-2026-44' },
        { label: 'Parties', value: 'Rivera Holdings • LCN Realty' },
        { label: 'Date', value: '2026-05-22' },
        { label: 'Topical agenda', value: 'Lease and occupancy' },
      ],
      summary:
        'Verification found a mismatch between the extracted record and the latest uploaded support file.',
      steps: [
        { label: 'Uploaded Docs Verifying', status: 'done' },
        { label: 'Docs Scanning', status: 'done' },
        { label: 'Generating Summary', status: 'done' },
        { label: 'Anchor Pending', status: 'verifying' },
      ],
      offChainHash: '0xC77...1B4',
      onChainHash: '0xE91...8D0',
      integrityStatus: 'Review',
    },
    whitelist: {
      grants: [
        {
          id: 'rivera-counsel',
          name: 'Atty. Rivera',
          email: 'rivera@lexchain.app',
          accessLabel: 'Verify access',
          actionLabel: 'Verify',
        },
        {
          id: 'lcn-owner',
          name: 'LCN Owner',
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
];
