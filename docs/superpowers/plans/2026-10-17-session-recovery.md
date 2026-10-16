# Session Recovery and Backend Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** End rejected portal sessions cleanly and show useful backend errors across document, draft, access, notification, and review flows without losing form input.

**Architecture:** Add one shared browser request/error path in `src/shared/api/`, preserving current URL, method, body, headers, credentials, and cache behavior. Keep route-level role checks in their current handlers, and make those handlers preserve upstream authentication failures before mapping successful non-lawyer profiles to forbidden. Feature-specific errors such as upload duplicate recovery remain specialized while consuming shared error parsing.

**Tech Stack:** Next.js App Router, TypeScript, React Query, Vitest, Playwright browser checks.

**Spec:** `docs/superpowers/specs/2026-10-17-session-recovery-design.md`

## Global Constraints

- No token refresh, backend changes, new permission rules, or changes to authentication request payloads.
- No conversion of `403` or `404` into session expiration.
- Preserve HTTP methods, request bodies, multipart encoding, query semantics, and same-origin cookie/server bearer transport.
- Do not broadly rewrite unrelated admin, signup, or account-authentication requests.
- Preserve feature-specific error behavior from #116 and existing document, draft, access, notification, and review flows.

## Review Focus

- Concurrent `401` responses must produce one logout and one `/login` navigation; malformed/logout-failing cleanup must still not loop. Pin with shared-client tests.
- Backend `403` and `404` must preserve status and must not clear cookies or navigate. Pin with shared-client and route tests.
- Empty, malformed, legacy `detail`, and message-based error bodies must produce a readable error while retaining status/details. Pin with parser/API tests.
- Backend field errors may name unknown or malformed fields; those remain visible in a form-level summary and must not hide entered values. Pin with form tests.
- `/users/` can return `401`, `403`, or a successful non-lawyer profile; only upstream `401` is session expiry. Pin in both participant and activity route tests.

---

### Task 1: Shared portal error parsing and unauthorized recovery

**Files:**
- Create: `src/shared/api/portal-error.ts`
- Modify: `src/shared/api/client.ts`
- Modify: `src/features/documents/portal-upload.ts`
- Test: `src/shared/api/portal-error.test.ts`
- Test: `src/shared/api/client.test.ts`
- Test: `src/features/documents/portal-upload.test.ts`

**Interfaces:**
- Produces `PortalApiError extends Error` with readonly `status: number` and `details: unknown`, plus one response-body parser that accepts an unknown JSON body and status and returns that error.
- Produces `portalRequest(url: string, init?: RequestInit): Promise<Response>` for same-origin portal requests and retains `portalFetch<T>(path: string): Promise<T>` as the existing JSON convenience API.
- `portalRequest` performs logout/navigation recovery on `401`, then throws `PortalApiError` for every non-OK response; successful response bodies remain available to callers for their existing JSON/no-content handling.
- A failed response body is parsed once; the error message precedence is `message`, then `detail`, then safe status fallback. Original `details`, including `reason` and `errors`, remain available.

- [ ] **Step 1: Add parser tests** for message precedence, legacy `detail`, empty/malformed/non-object bodies, `details` preservation, and status preservation.
- [ ] **Step 2: Run the parser test** with `pnpm exec vitest run src/shared/api/portal-error.test.ts`; confirm it fails because the parser does not exist.
- [ ] **Step 3: Implement `PortalApiError` and the parser** in `src/shared/api/portal-error.ts` with no casts from unvalidated body values.
- [ ] **Step 4: Run the parser test** and confirm all cases pass.
- [ ] **Step 5: Add client tests** proving one `/api/portal/logout` POST and one `location.replace('/login')` for overlapping `401`s, and no cleanup/navigation for `403` or `404`. Also prove failed logout does not cause a navigation loop.
- [ ] **Step 6: Implement `portalRequest`** in `src/shared/api/client.ts`; deduplicate the in-flight unauthorized cleanup, then throw `PortalApiError` with the original status/details for non-OK responses. Keep `portalFetch` as the path-based JSON wrapper over this function.
- [ ] **Step 7: Run client tests** with `pnpm exec vitest run src/shared/api/client.test.ts` and confirm they pass.
- [ ] **Step 8: Adapt `UploadRequestError`** to consume shared parsed message/status/details while retaining its upload-specific reason, validation errors, related-document data, and duplicate recovery behavior; keep its focused assertions passing.
- [ ] **Step 9: Run upload tests** with `pnpm exec vitest run src/features/documents/portal-upload.test.ts`.
- [ ] **Step 10: Commit** the shared request/error behavior and its tests.

### Task 2: Route authentication status preservation

**Files:**
- Modify: `src/app/api/portal/documents/[id]/parties/route.ts`
- Modify: `src/app/api/portal/documents/[id]/audit-logs/route.ts`
- Test: `src/app/api/portal/documents/[id]/parties/route.test.ts`
- Test: `src/app/api/portal/documents/[id]/audit-logs/route.test.ts`

**Interfaces:**
- Consumes the existing upstream `/users/` response and current route response format.
- Produces behavior where an upstream profile `401` is returned with status `401` before role evaluation; successful profile responses for users without lawyer access retain `403`.

- [ ] **Step 1: Add participant-route regression cases** for `/users/` `401` pass-through and successful non-lawyer `403`.
- [ ] **Step 2: Run** `pnpm exec vitest run 'src/app/api/portal/documents/[id]/parties/route.test.ts'` and confirm the `401` case fails.
- [ ] **Step 3: Add activity-route regression cases** for `/users/` `401` pass-through and successful non-lawyer `403`.
- [ ] **Step 4: Update both route handlers** to return the upstream `/users/` status/body for `401` before role mapping; preserve existing role-denial and document endpoint behavior.
- [ ] **Step 5: Run both route test files** and confirm `401`, `403`, and existing `404` assertions pass.
- [ ] **Step 6: Commit** the route status fix and tests.

### Task 3: Adopt shared request behavior in document APIs

**Files:**
- Modify: `src/features/documents/document-draft-api.ts`
- Modify: `src/features/documents/document-lifecycle-api.ts`
- Modify: `src/features/documents/extraction-api.ts`
- Modify: `src/features/documents/search-api.ts`
- Modify: `src/features/documents/portal-upload.ts`
- Test: `src/features/documents/document-draft-api.test.ts`
- Test: `src/features/documents/document-lifecycle-api.test.ts`
- Test: `src/features/documents/extraction-api.test.ts`
- Test: `src/features/documents/portal-upload.test.ts`
- Test: create `src/features/documents/search-api.test.ts` if no existing test covers it.

**Interfaces:**
- Consumes `portalRequest(url, init?)` and `PortalApiError` from Task 1.
- Each migrated call retains its existing request method, query/path encoding, headers, body encoding, credentials, cache semantics, and success parsing.

- [ ] **Step 1: Update document API tests** to assert backend message/status/details and shared `401` handling for draft, lifecycle, extraction, upload, and search calls.
- [ ] **Step 2: Run the focused document API tests** and confirm new assertions fail before migration.
- [ ] **Step 3: Migrate document API helpers** to `portalRequest`, keeping specialized error classes as thin feature-facing wrappers only where callers depend on their names/status fields; preserve signed-copy upload behavior.
- [ ] **Step 4: Run focused document API tests** and confirm existing upload recovery and endpoint-specific behavior remain intact.
- [ ] **Step 5: Commit** the document API migration and tests.

### Task 4: Adopt shared request behavior in access and notifications

**Files:**
- Modify: `src/features/access/portal-access-api.ts`
- Modify: `src/features/access/components/invite-participant-form.tsx`
- Modify: `src/features/access/pages/invitations-page.tsx`
- Modify: `src/features/portal/notifications-api.ts`
- Test: `src/features/access/portal-access-api.test.ts`
- Test: `src/features/access/components/invite-participant-form.test.tsx`
- Test: `src/features/access/pages/invitations-page.test.tsx`
- Test: create `src/features/portal/notifications-api.test.ts` if no existing coverage exercises these requests.

**Interfaces:**
- Consumes `portalRequest(url, init?)` and `PortalApiError` from Task 1.
- `searchUserByEmail` continues to return `null` for `404`; other failed access and notification requests retain the backend error.

- [ ] **Step 1: Add/adjust API tests** to assert backend message/status/details, `401` recovery, and `searchUserByEmail` continuing to return `null` for its expected `404` result.
- [ ] **Step 2: Migrate access and notification requests** to `portalRequest`; retain methods, encoded IDs/query strings, credentials, and existing success parsing.
- [ ] **Step 3: Preserve useful failures in both invitation interfaces**: show the backend message for participant-invite/search and accept/decline failures; map `details.errors` for existing `email`/`role` controls; keep unmatched entries in the alert summary; retain entered values; and keep the account-search 429 fallback when the backend supplies no useful message.
- [ ] **Step 4: Run access API, participant-invite form, invitation page, and notification API tests** and confirm they pass.
- [ ] **Step 5: Commit** the access and notification migration and tests.

### Task 5: Adopt shared errors in direct portal page requests

**Files:**
- Modify: `src/features/documents/pages/documents-page.tsx`
- Modify: `src/features/documents/pages/documents-id-page.tsx`
- Modify: `src/features/documents/pages/documents-id-activity-page.tsx`
- Modify: `src/features/documents/pages/documents-id-review-page.tsx`
- Modify: `src/features/documents/pages/documents-id-viewer-page.tsx`
- Modify: `src/features/documents/pages/upload-page.tsx`
- Modify: `src/features/documents/pages/upload-processing-page.tsx`
- Modify: `src/features/portal/pages/dashboard-page.tsx`
- Modify: `src/features/portal/portal-layout.tsx`
- Test: `src/features/documents/pages/documents-page.test.tsx`
- Test: `src/features/documents/pages/documents-id-page.test.tsx`
- Test: `src/features/documents/pages/upload-page.test.tsx`
- Test: `src/features/portal/portal-dashboard.test.ts`
- Test: add focused coverage to the existing review, viewer, activity, or processing page test where that page has no matching assertions.

**Interfaces:**
- Consumes `portalRequest(url, init?)` and `PortalApiError` from Task 1.
- Direct portal fetches use the shared request path; unrelated `/api/admin/dashboard` and logout interactions remain as they are.

- [ ] **Step 1: Add/adjust page tests** proving backend messages and matching `details.errors` render as field errors, unmatched/malformed details remain visible in a form-level error summary, and entered values remain after failed submissions.
- [ ] **Step 2: Run the focused page tests** and confirm newly added assertions fail before migration.
- [ ] **Step 3: Migrate the listed direct portal requests** to `portalRequest`, preserving each request's method, body, encoding, cache and success behavior.
- [ ] **Step 4: Run all focused page tests** for changed files and confirm they pass.
- [ ] **Step 5: Commit** the page migration and regression tests.

### Task 6: Deterministic browser recovery check and full verification

**Files:**
- Create: `e2e/session-recovery.mjs`
- Modify: `package.json`
- Possibly modify: `src/shared/api/client.test.ts` only if browser findings expose a missing unit seam.

**Interfaces:**
- The script follows the existing `e2e/*.mjs` conventions and can be run with `pnpm e2e:session-recovery` against a local production server.
- All backend endpoints are stubbed; the check proves frontend behavior only.

- [ ] **Step 1: Add the browser script** to start with a present but backend-rejected portal cookie, observe a single navigation to `/login`, and verify no redirect loop.
- [ ] **Step 2: Extend the script** with stubbed validation, `403`, and `404` responses; assert validation feedback and retained form values and no sign-in navigation for forbidden/not-found responses.
- [ ] **Step 3: Add `e2e:session-recovery`** to `package.json` and run `pnpm e2e:session-recovery` against the production server, confirming it passes.
- [ ] **Step 4: Run** `pnpm exec vitest run` for the full frontend suite, `pnpm typecheck`, `pnpm lint`, and `pnpm build`; report each result separately.
- [ ] **Step 5: Review the full diff** for changed methods, bodies, encoding, credentials, cookie behavior, input preservation, and accidental admin/auth scope changes; fix any regression.
- [ ] **Step 6: Commit** the browser recovery check and its package script after verification.
