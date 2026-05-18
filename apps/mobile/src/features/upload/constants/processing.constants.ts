export const HEADER_CONTENT_GAP = 12;

export const PROCESSING_STEPS = [
  { label: 'Extracting', durationMs: 1200 },
  { label: 'Scanning', durationMs: 1400 },
  { label: 'Generating Summary using AI', durationMs: 1600 },
  { label: 'Uploaded Successfully', durationMs: 900 },
] as const;

export const SUMMARY_STEP_INDEX = 2;
export const UPLOADED_STEP_INDEX = 3;
export const SUMMARY_WAIT_PERCENT = 70;
