# Owned and Shared Documents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate owned and shared documents in the library and present document lifecycle and finalized processing states accurately across existing screens.

**Architecture:** Reuse the existing documents and profile queries, partition the response by `is_owner`, and keep the established local filtering and sorting flow. Gate processing presentation by the document lifecycle in each existing surface; retain the current routes, permission checks, error handling, and review-status behavior.

**Tech Stack:** Next.js App Router, React, TypeScript, TanStack Query, Vitest/Testing Library, Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-17-owned-shared-documents-design.md`

## Global Constraints

- Use the existing documents and profile queries and the backend `is_owner`, `lifecycle`, and `status` fields; do not add an endpoint or backend state.
- Preserve existing routes, API request behavior, React Query keys, action permissions, and error contracts.
- `is_owner` is used only to partition lists; it does not grant or infer document-action permissions.
- Processing badges, rows, and counts are omitted unless lifecycle is `FINALIZED`.
- Use Node 24.12.0 or newer and pnpm 11.13.0; do not add dependencies.

## Review Focus

1. A missing runtime `is_owner` value must not silently place a document into either partition; test explicit `true`, explicit `false`, and missing values in Task 1.
2. Switching ownership tabs must reset the page while preserving the active search and filters; test a filtered tab switch and page reset in Task 1.
3. Mobile and desktop results must share the same paginated slice; test that records beyond the current page are absent from both views in Task 1.
4. A stale or unknown status on a pre-finalized document must not appear as OCR progress or failure, including in the portal-shell count; test `PREPARING`, `READY_FOR_SIGNATURE`, and `SIGNED` with populated statuses in Task 2.
5. A `FINALIZED` plus `FAILED` record must link to its existing document and offer no upload or finalization retry; test the processing page and detail state in Task 2 and browser flow in Task 3.

---

### Task 1: Partition the document library by ownership

**Files:**
- Modify: `src/features/documents/document-library.ts`
- Modify: `src/features/documents/pages/documents-page.tsx`
- Test: `src/features/documents/document-library.test.ts`
- Test: `src/features/documents/pages/documents-page.test.tsx`

**Interfaces:**
- Produces: `getDocumentsByOwnership<T extends DocumentListItem>(documents: T[], ownership: 'owned' | 'shared'): T[]`, returning only explicit `is_owner === true` records for `owned` and `is_owner === false` records for `shared`.
- Consumes: existing `getVisibleDocuments`, `getDocumentLifecycles`, `getPortalUiRole`, and generated `DocumentUploadResponse` fields.

- [ ] **Step 1: Add failing ownership-partition tests**

In `document-library.test.ts`, add `getDocumentsByOwnership separates explicit owner and shared records`: verify explicit `true` and `false` records are returned in input order and a record with missing `is_owner` is returned by neither partition.

- [ ] **Step 2: Run the focused helper test and verify it fails**

Run: `pnpm exec vitest run src/features/documents/document-library.test.ts`
Expected: FAIL because `getDocumentsByOwnership` is not defined.

- [ ] **Step 3: Implement `getDocumentsByOwnership`**

Use strict boolean equality so an absent or malformed runtime value is not classified as shared by default.

- [ ] **Step 4: Add failing directory interaction tests**

In `documents-page.test.tsx`, add `defaults each role to its ownership tab and scopes results and summaries`, using mixed owner/shared fixtures to verify lawyer and client defaults, unfiltered tab counts, switching tabs, selected-tab lifecycle options and summaries, filtering/sorting within the selected partition, and ownership-specific filtered-empty state. Add `resets page on tab change and shares paginated results across layouts`: verify the tab change resets page to the first page, active search/filter values remain applied, and records beyond the current page are absent from both desktop and mobile results. Add `counts canonical review status only for finalized documents`: verify `AWAITING_REVIEW` contributes to Ready for Review and pre-finalized statuses do not contribute to processing metrics.

- [ ] **Step 5: Run the focused directory test and verify the new assertions fail**

Run: `pnpm exec vitest run src/features/documents/pages/documents-page.test.tsx`
Expected: FAIL on the new ownership, count, summary, canonical review, or pagination assertions.

- [ ] **Step 6: Update the directory**

Use `getPortalUiRole` for the existing lawyer/client role mapping. Keep the selected ownership explicit only after a user changes tabs; otherwise derive the active default from the mapped role. Partition before deriving filter options, visible results, metrics, lifecycle distribution, and recently-created items. Reset the page on tab switch and render the same paginated slice in both layouts. Preserve existing query loading/error/retry behavior and lawyer-only entry actions.

- [ ] **Step 7: Run the focused directory tests**

Run: `pnpm exec vitest run src/features/documents/document-library.test.ts src/features/documents/pages/documents-page.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit the library change**

```bash
git add src/features/documents/document-library.ts src/features/documents/document-library.test.ts src/features/documents/pages/documents-page.tsx src/features/documents/pages/documents-page.test.tsx
git commit -m "feat: separate owned and shared documents"
```

### Task 2: Gate processing presentation by finalized lifecycle

**Files:**
- Modify: `src/features/portal/pages/dashboard-page.tsx` (use `ApiSchema<'DocumentUploadResponse'>` for returned list rows)
- Modify: `src/features/portal/portal-dashboard.ts`
- Modify: `src/features/portal/portal-layout.tsx`
- Modify: `src/features/documents/pages/documents-page.tsx`
- Modify: `src/features/documents/document-ui.ts`
- Modify: `src/features/documents/index.ts`
- Modify: `src/features/documents/pages/documents-id-page.tsx`
- Modify: `src/features/documents/components/document-workspace.tsx`
- Modify: `src/features/documents/pages/upload-page.tsx`
- Modify: `src/features/documents/pages/upload-processing-page.tsx`
- Test: `src/app/portal/dashboard/page.test.tsx`
- Test: `src/features/portal/portal-dashboard.test.ts`
- Test: `src/features/documents/document-ui.test.ts`
- Test: `src/features/documents/pages/documents-page.test.tsx`
- Test: `src/features/documents/pages/documents-id-page.test.tsx`
- Test: `src/features/documents/components/document-workspace.test.tsx`
- Test: `src/features/documents/pages/upload-page.test.tsx`
- Test: `src/app/portal/upload/processing/page.test.tsx`

**Interfaces:**
- Consumes: `getDocumentsByOwnership` from Task 1 and the existing backend document lifecycle/status types.
- Produces: `getFinalizedProcessingDocuments<T extends { lifecycle: string; status?: string | null }>(documents: T[]): T[]`, shared by the lawyer dashboard processing card and portal-shell processing count; it returns only `FINALIZED` records with `PROCESSING` or `PENDING` status, matching status case-insensitively after trimming.
- Produces: `getDocumentProcessingStatusLabel(lifecycle: string, status?: string | null): string`, which returns `Processing failed` for `FINALIZED` plus `FAILED` and otherwise delegates to the existing status label helper. Render status only when lifecycle is `FINALIZED`.
- Preserves: `getDocumentStatusLabel` and extraction/review status semantics in `review-workspace.tsx`.

- [ ] **Step 1: Add failing pre-finalization and finalized-failure tests**

Update the existing screen tests to provide lifecycle with every status fixture. In `document-ui.test.ts`, add `labels finalized processing failure without changing extraction labels`: verify the document-processing helper returns `Processing failed` for `FINALIZED`/`FAILED` while `getDocumentStatusLabel('FAILED')` remains `Failed`. In `portal-dashboard.test.ts`, add `returns only finalized processing and pending documents`, including pre-finalized `PROCESSING`/`PENDING` rows and finalized `FAILED` rows as exclusions. In `documents-page.test.tsx`, add `shows lifecycle and hides processing for pre-finalized list records`, covering populated status values for `PREPARING`, `READY_FOR_SIGNATURE`, and `SIGNED`, plus visible status for `FINALIZED`. In `documents-id-page.test.tsx` and `document-workspace.test.tsx`, add `hides processing status before finalization while keeping lifecycle visible`. In `upload-page.test.tsx`, add `omits processing status from a SIGNED upload result`. In `src/app/portal/dashboard/page.test.tsx`, add `shows lifecycle and only owned finalized records in lawyer document cards`, with owned/shared records and finalized/non-finalized failed or processing combinations. In `src/app/portal/upload/processing/page.test.tsx`, add `waits for finalization before showing OCR status` with an unknown processing-like status, and `links finalized processing failures to the document without upload recovery`; the latter asserts a `/portal/documents/doc-1` link and no `/portal/upload` link. Verify `AWAITING_REVIEW` is labeled Ready for review and no test changes extraction/review semantics.

- [ ] **Step 2: Run the affected focused tests and verify the new assertions fail**

Run: `pnpm exec vitest run src/app/portal/dashboard/page.test.tsx src/features/portal/portal-dashboard.test.ts src/features/documents/document-ui.test.ts src/features/documents/pages/documents-page.test.tsx src/features/documents/pages/documents-id-page.test.tsx src/features/documents/components/document-workspace.test.tsx src/features/documents/pages/upload-page.test.tsx src/app/portal/upload/processing/page.test.tsx`
Expected: FAIL where pre-finalized processing is currently displayed, finalized processing failures are labeled ambiguously, or finalized failure offers upload recovery.

- [ ] **Step 3: Add the shared status helpers**

In `document-ui.ts`, implement and export `getDocumentProcessingStatusLabel(lifecycle, status)` so finalized `FAILED` returns `Processing failed` and other values delegate to `getDocumentStatusLabel`; re-export it from `index.ts`. In `portal-dashboard.ts`, implement the tested `getFinalizedProcessingDocuments` helper that returns finalized `PROCESSING` and `PENDING` rows.

- [ ] **Step 4: Apply lifecycle gates to document surfaces**

In directory, dashboard, detail, workspace, and upload result, render processing status only when lifecycle is `FINALIZED`; keep lifecycle labels independent and use `getDocumentProcessingStatusLabel`. Leave `getDocumentStatusLabel` unchanged for extraction review. Type dashboard document rows as `ApiSchema<'DocumentUploadResponse'>` so the existing list response supplies lifecycle and ownership fields. On the lawyer dashboard, show lifecycle in each document card, partition documents by `is_owner === true`, use `getFinalizedProcessingDocuments` for the processing card, and restrict attention items to finalized `FAILED` documents. In the portal shell, use `getFinalizedProcessingDocuments` for the processing count. Leave the client welcome panel and admin-provided dashboard metrics unchanged.

- [ ] **Step 5: Make the processing page lifecycle-aware**

Before `FINALIZED`, display lifecycle and explain that OCR processing waits for finalization, without rendering a processing status or failure/reupload action. After finalization, retain existing progress, completion, and review behavior. For `FINALIZED` plus `FAILED`, label it as a processing failure, link to `/portal/documents/${id}`, and do not offer upload or refinalization. Keep lookup errors retryable and do not alter review-workspace status behavior.

- [ ] **Step 6: Run the focused affected tests**

Run: `pnpm exec vitest run src/app/portal/dashboard/page.test.tsx src/features/portal/portal-dashboard.test.ts src/features/documents/document-ui.test.ts src/features/documents/pages/documents-page.test.tsx src/features/documents/pages/documents-id-page.test.tsx src/features/documents/components/document-workspace.test.tsx src/features/documents/pages/upload-page.test.tsx src/app/portal/upload/processing/page.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit the lifecycle/status change**

```bash
git add src/features/portal/pages/dashboard-page.tsx src/features/portal/portal-dashboard.ts src/features/portal/portal-layout.tsx src/features/portal/portal-dashboard.test.ts src/app/portal/dashboard/page.test.tsx src/features/documents/document-ui.ts src/features/documents/document-ui.test.ts src/features/documents/index.ts src/features/documents/pages/documents-page.tsx src/features/documents/pages/documents-page.test.tsx src/features/documents/pages/documents-id-page.tsx src/features/documents/pages/documents-id-page.test.tsx src/features/documents/components/document-workspace.tsx src/features/documents/components/document-workspace.test.tsx src/features/documents/pages/upload-page.tsx src/features/documents/pages/upload-page.test.tsx src/features/documents/pages/upload-processing-page.tsx src/app/portal/upload/processing/page.test.tsx
git commit -m "fix: show processing state only after finalization"
```

### Task 3: Add deterministic browser acceptance coverage

**Files:**
- Create: `e2e/owned-shared-documents.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing routes and frontend behavior from Tasks 1 and 2.
- Produces: `pnpm e2e:owned-shared-documents`, which runs the focused Playwright script against `E2E_BASE_URL` or `http://localhost:3000`.

- [ ] **Step 1: Add the browser script and package entry**

Follow existing `e2e/*.mjs` scripts: use Playwright Chromium, stub same-origin API routes with backend-shaped mixed owner/shared fixtures, create isolated lawyer/client contexts with role cookies, and collect page errors. Cover role defaults, tab counts/switching, search/filter scope, summary scope, pagination, lifecycle/status visibility, canonical review status, and finalized-failure recovery. Assert the client dashboard remains the welcome panel, lawyer cards exclude shared records, and the portal-shell processing count excludes non-finalized records.

- [ ] **Step 2: Run browser acceptance against a production server**

Run: `pnpm build`
Expected: PASS.

Run: `pnpm start` in a separate terminal, then `pnpm e2e:owned-shared-documents`.
Expected: PASS with no browser page errors; output identifies API responses as stubbed frontend evidence.

- [ ] **Step 3: Run the repository verification suite**

Run: `pnpm test`, `pnpm test:scripts`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
Expected: all commands PASS. Report any unrelated baseline failure separately.

- [ ] **Step 4: Review and commit browser coverage**

Review the script for deterministic waits, fixture-only API calls, accessible selectors, and absence of credentials or real document data. Then commit:

```bash
git add e2e/owned-shared-documents.mjs package.json
git commit -m "test: cover owned and shared document flows"
```
