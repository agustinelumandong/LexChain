# Task 2: Actionable portal notifications

- Commit: `feat: make portal notifications actionable`
- Changed files: `src/features/portal/portal-layout.tsx`, `src/features/portal/components/portal-topbar.tsx`, `src/features/portal/components/portal-topbar.test.tsx`, `src/features/portal/pages/notifications-page.tsx`, `src/app/portal/notifications/page.test.tsx`, `src/app/portal/layout.test.tsx`

## Verification

- `pnpm exec vitest run src/features/portal/components/portal-topbar.test.tsx src/app/portal/notifications/page.test.tsx src/app/portal/layout.test.tsx` before implementation: failed as expected on missing destination links and per-item behavior.
- The same focused Vitest command after implementation: passed, 3 files and 25 tests.
- `pnpm typecheck`: passed (`tsc --noEmit`).
- `git diff --check`: passed.

## Self-review

- Both portal notification surfaces use the Task 1 shared destination resolver and generated `PortalNotification` shape. Draft destinations open in a new tab with `rel="noreferrer"`; the topbar sends missing or invalid destinations to the inbox.
- The shell owns individual-read mutation state across portal navigation. Item clicks start the PATCH without waiting for it, success invalidates all notification queries, and failure leaves the unread item visible and retryable. Read-all remains an inbox-only action.
- The shell count/list and mounted inbox queries use the specified 45-second React Query interval. Query enabling and mount lifetimes remain unchanged.
- Focused tests cover link destinations, failed-read retry, missing-destination actions, read links, distinct individual/read-all requests, and interval configuration. No unrelated source files changed.
- Full suite, lint, and build were not run for this task.
