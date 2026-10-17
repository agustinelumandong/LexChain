# Document Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep portal notifications current and provide safe, actionable links to related documents and Google drafts.

**Architecture:** Keep notification transport and React Query in the existing portal feature. Add one shared destination resolver used by the topbar and inbox, preserve the generated notification shape, and keep read mutations separate from navigation and read-all.

**Tech Stack:** Next.js App Router, React Query, TypeScript, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-18-document-notifications-design.md`

## Global Constraints

- Use Node **24.12.0 or newer** and **pnpm 11.13.0**.
- Poll at **45 seconds** while the corresponding authenticated portal query is active.
- Use only `event_metadata.document_id` and `event_metadata.draft_url` as the approved frontend assumptions; validate before navigation and never render arbitrary metadata.
- Preserve same-origin notification API operations, backend-owned read state, query invalidation, and current error contracts.
- Add no dependency and do not edit generated OpenAPI types.
- Deterministic browser checks use intercepted same-origin API responses and do not count as live-backend evidence.

## Review Focus

- Hostile or malformed `draft_url` and `document_id` values must never become navigation targets; pin in the destination resolver tests.
- Missing metadata and unknown runtime notification types must stay visible and use only the documented safe fallback; pin in resolver and inbox tests.
- A read failure must leave an item unread and retryable while navigation can still proceed; pin in topbar/inbox tests and browser coverage.
- Opening one item must issue only the individual-read request; explicit read-all must remain a separate operation; assert request paths in the browser check.
- Polling must stop when its supported portal query unmounts or becomes disabled; verify a new item after one 45-second interval and no further requests after leaving the portal in the browser check.

---

### Task 1: Preserve notification data and resolve safe destinations

**Files:**
- Modify: `src/features/portal/notifications-api.ts`
- Create: `src/features/portal/notification-destination.ts`
- Create: `src/features/portal/notification-destination.test.ts`

**Interfaces:**
- Consumes: generated `ApiSchema<'NotificationResponse'>`, `googleDraftReturnPath` from `src/shared/utils/google-draft-return-context.ts`, and `isGoogleDraftUrl` from `src/features/documents/document-draft-api.ts`.
- Produces: `PortalNotification = ApiSchema<'NotificationResponse'>` and `getNotificationDestination(notification: Pick<PortalNotification, 'type' | 'event_metadata'>): { href: string; external: boolean } | null`.

- [ ] **Step 1: Write resolver tests** for document notification IDs, each of `draft_comment`, `draft_reply`, `draft_resolved`, and `draft_reopened`, valid draft URL priority, document-ID fallback, malformed IDs, invalid URLs, absent metadata, and unknown runtime type.
- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm exec vitest run src/features/portal/notification-destination.test.ts`
Expected: FAIL because `getNotificationDestination` does not exist.

- [ ] **Step 3: Implement the resolver and preserve the generated notification shape**

Use `googleDraftReturnPath` to validate and build internal document destinations. For draft event types, accept `draft_url` only through `isGoogleDraftUrl`; otherwise try the validated document ID. Return `null` for unknown types or no valid target.

- [ ] **Step 4: Run the resolver test**

Run: `pnpm exec vitest run src/features/portal/notification-destination.test.ts`
Expected: PASS for all supported event types and invalid-input cases.

- [ ] **Step 5: Commit the task**

```bash
git add src/features/portal/notifications-api.ts src/features/portal/notification-destination.ts src/features/portal/notification-destination.test.ts
git commit -m "feat: resolve safe notification destinations"
```

### Task 2: Wire destinations, per-item reads, and active polling

**Files:**
- Modify: `src/features/portal/portal-layout.tsx`
- Modify: `src/features/portal/components/portal-topbar.tsx`
- Modify: `src/features/portal/components/portal-topbar.test.tsx`
- Modify: `src/features/portal/pages/notifications-page.tsx`
- Modify: `src/app/portal/notifications/page.test.tsx`
- Modify: `src/app/portal/layout.test.tsx`

**Interfaces:**
- Consumes: Task 1's `PortalNotification` and `getNotificationDestination`.
- Produces: Topbar notification links, individually scoped read actions, and 45-second list/count refreshes in active portal queries.

- [ ] **Step 1: Add component tests** for internal document links, new-tab Google draft links with `rel="noreferrer"`, topbar per-item read callback, inbox fallback for missing destinations, read rows that remain actionable, and unread rows that remain markable without a destination.
- [ ] **Step 2: Run the focused component tests to verify the new assertions fail**

Run: `pnpm exec vitest run src/features/portal/components/portal-topbar.test.tsx src/app/portal/notifications/page.test.tsx src/app/portal/layout.test.tsx`
Expected: FAIL for the new navigation and per-item behavior.

- [ ] **Step 3: Add the individual-read mutation to the portal shell and use the shared destination resolver in both surfaces**

Topbar item activation calls `markNotificationRead(id)` for that item only and navigates immediately. Keep the item visible and retryable after a failed PATCH; invalidate all notification queries only after success. Keep read-all on the inbox. Set `refetchInterval: 45_000` on the shell count/list queries and inbox list query while they are enabled/mounted.

- [ ] **Step 4: Run focused notification component and layout tests**

Run: `pnpm exec vitest run src/features/portal/components/portal-topbar.test.tsx src/app/portal/notifications/page.test.tsx src/app/portal/layout.test.tsx`
Expected: PASS; failed read requests retain unread UI and do not invoke read-all.

- [ ] **Step 5: Commit the task**

```bash
git add src/features/portal/portal-layout.tsx src/features/portal/components/portal-topbar.tsx src/features/portal/components/portal-topbar.test.tsx src/features/portal/pages/notifications-page.tsx src/app/portal/notifications/page.test.tsx src/app/portal/layout.test.tsx
git commit -m "feat: make portal notifications actionable"
```

### Task 3: Align mock data and add deterministic browser coverage

**Files:**
- Modify: `src/lib/mocks/portal.ts`
- Modify: `src/lib/mocks/portal.test.ts`
- Create: `e2e/notifications.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 1's notification shape and Task 2's visible behavior.
- Produces: Contract-shaped mock notifications and the `pnpm e2e:notifications` browser command.

- [ ] **Step 1: Write the browser script and mock-shape assertions**

The Playwright script intercepts portal API requests, changes the fixture after the first response, and uses `page.clock.fastForward(45_000)` to prove active-tab arrival and badge refresh. Assert document navigation, safe draft new-tab navigation, missing/malformed metadata fallback, one-item PATCH versus read-all PATCH, failed single-read retry, and no notification polling after leaving the portal. Mock tests assert fixtures and uploaded-document notifications include `type` and `event_metadata`.

- [ ] **Step 2: Run the focused mock test and browser script to verify the new assertions fail**

Run: `pnpm exec vitest run src/lib/mocks/portal.test.ts`
Run: `node e2e/notifications.mjs` with the local production or development server available at `E2E_BASE_URL`.
Expected: the mock shape and behavior assertions fail against the current fixtures and UI.

- [ ] **Step 3: Update mock notification fixtures and wire the browser script**

Keep fixtures limited to the documented event fields and route behavior; add `e2e:notifications` as `node e2e/notifications.mjs`.

- [ ] **Step 4: Run the focused mock test and deterministic browser check**

Run: `pnpm exec vitest run src/lib/mocks/portal.test.ts`
Run: `pnpm e2e:notifications`
Expected: PASS with no browser page errors or unexpected API requests; the output identifies the check as stubbed frontend behavior.

- [ ] **Step 5: Commit the task**

```bash
git add src/lib/mocks/portal.ts src/lib/mocks/portal.test.ts e2e/notifications.mjs package.json
git commit -m "test: cover actionable notifications in browser"
```

### Final verification

- [ ] Run the full unit suite: `pnpm test --maxWorkers=2`.
- [ ] Run script tests: `pnpm test:scripts`.
- [ ] Run typecheck and lint: `pnpm typecheck` and `pnpm lint`.
- [ ] Run the production build: `pnpm build`.
- [ ] Run `pnpm e2e:notifications` against the local app and record the result as stubbed frontend evidence.
- [ ] Review the full branch diff and run `git diff --check`; confirm unrelated work remains untouched.
- [ ] Request a fresh whole-branch code review before opening the PR against `dev`.

## Evidence Boundary

The deterministic notification browser script verifies the frontend with intercepted requests. A live-backend journey remains a separate parent-workflow check and requires a configured disposable backend and test account; the notification script does not claim that evidence.
