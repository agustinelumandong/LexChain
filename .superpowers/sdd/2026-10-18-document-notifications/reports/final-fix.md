# Final review fix report

## Changes

- Deduplicated concurrent individual-read requests by notification ID in the shared notification API helper. The in-flight entry clears on success or failure, so failed requests remain retryable. Inbox and topbar navigation remain immediate, and read-all is unchanged.
- Extended the browser check to open the topbar from the dashboard, click a notification with malformed destination metadata, and verify navigation to `/portal/notifications`.
- Added a focused transport regression test proving concurrent same-ID calls issue one PATCH.

## Verification

- Red check: `pnpm exec vitest run src/features/portal/notifications-api.test.ts` — failed on the new assertion before the guard; two PATCH calls were observed.
- `pnpm exec vitest run src/features/portal/notifications-api.test.ts src/features/portal/components/portal-topbar.test.tsx src/app/portal/notifications/page.test.tsx src/app/portal/layout.test.tsx` — passed, 4 files / 33 tests.
- Temporary server: `pnpm dev -- --port 3100` — ready at `http://localhost:3100`, stopped after the browser run.
- `pnpm exec node --input-type=module -e "process.env.E2E_BASE_URL='http://localhost:3100'; await import('./e2e/notifications.mjs')"` — passed. Portal API responses were intercepted; this is stubbed frontend behavior.
- `pnpm exec eslint src/features/portal/notifications-api.ts src/features/portal/notifications-api.test.ts e2e/notifications.mjs` — passed.
- `git diff --check` — passed.

## Coverage limits

This browser check verifies frontend behavior with intercepted portal API responses; no live-backend behavior is claimed.
