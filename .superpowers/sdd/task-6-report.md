# Task 6 report

## Delivered

- Failed processing now exposes an existing document link, an upload-replacement link, and a disabled retry control with the exact demo-mode explanation. No retry is simulated.
- Unread notifications are explicitly named `Mark {title} as read`; read notifications are non-interactive and show `Marked as read`.

## Verification

- RED: the requested recovery and notification assertions failed before implementation.
- GREEN: `pnpm exec vitest run app/portal/lib/processing-monitor.test.ts app/portal/processing/page.test.tsx app/portal/notifications/page.test.tsx` — 3 files, 5 tests passed.
- Required command: `pnpm test -- --run app/portal/lib/processing-monitor.test.ts app/portal/processing/page.test.tsx app/portal/notifications/page.test.tsx` — 39 files, 152 tests passed. The package script's extra separator makes Vitest run the complete suite.
- `pnpm exec eslint` for changed source and tests, plus `git diff --check` — passed.

## Ponytail simplification

Reused the monitor's existing local failure data and the existing notification mutations. Added no data model, route, dependency, retry handler, or fake success state.

## Concern

The monitor is intentionally local status-only demo data, so its controls reset on refresh. Notification read actions retain their existing backend proxy behavior.

## Review coverage follow-up

- Added focused Processing Monitor assertions that the failed item exposes `Open document` to `/portal/documents/demo-failed-lease` and that `Retry processing` is disabled.
- Verification: `pnpm exec vitest run app/portal/processing/page.test.tsx` — 1 file, 2 tests passed.
