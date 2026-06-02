export const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Deed of Sale', value: 'deed-of-sale' },
  { label: 'Lease Contract', value: 'lease-contract' },
] as const;

export const DOCUMENT_STATUS_OPTIONS = [
  { label: 'Verified', value: 'verified' },
  { label: 'Tampered', value: 'tampered' },
  { label: 'Failed', value: 'failed' },
  { label: 'Successful', value: 'successful' },
] as const;

export const DOCUMENT_SORT_OPTIONS = [
  {
    label: 'Newest first',
    value: 'newest',
    helperText: 'Most recent document dates at the top',
  },
  {
    label: 'Oldest first',
    value: 'oldest',
    helperText: 'Earlier document dates at the top',
  },
  {
    label: 'Title A-Z',
    value: 'title-az',
    helperText: 'Alphabetical by document title',
  },
] as const;
