# Issuer Document Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement issuer-only OCR review from processing status through approval and real finalization.

**Architecture:** Reuse the authenticated portal proxy and React Query. A small extraction client and a dedicated review route own temporary edit state; the backend owns saved text, flags, statuses, and lifecycle transitions.

**Tech Stack:** Next.js App Router, React 19, TypeScript, TanStack Query, Tailwind v4, Vitest, `@lexchain/types` generated OpenAPI types.

## Global Constraints

- Use `pnpm`; add no dependency or lockfile change.
- Type request and response data with `ApiSchema`; do not duplicate contract shapes.
- Clients only use `/api/portal/proxy` or `/api/portal/proxy-post`.
- Use `Document Issuer` and `Document Participant` in copy.
- Do not manufacture progress percentage or classify unknown status strings as complete.
- Preserve unrelated dirty files and existing participant, integrity, snapshot, and audit behavior.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `apps/web/app/portal/lib/extraction-api.ts` | Typed extraction GET/PATCH/POST requests via the existing proxy. |
| `apps/web/app/portal/documents/[id]/review/page.tsx` | Issuer review, edits, semantic analysis, and approval. |
| `apps/web/app/portal/upload/processing/page.tsx` | Honest status polling and review handoff. |
| `apps/web/app/portal/documents/[id]/document-workspace.tsx` | Real finalization result and copy. |
| `apps/web/lib/portal-mock.ts` | Contract-faithful local extraction state. |

### Task 1: Add the typed extraction client

**Files:**
- Create: `apps/web/app/portal/lib/extraction-api.ts`
- Create: `apps/web/app/portal/lib/extraction-api.test.ts`

**Interfaces:**
- Consumes: `ApiSchema<'ExtractionReviewResponse'>`, `ApiSchema<'BlockEdit'>`, and existing proxy routes.
- Produces: `getExtractionReview(id)`, `saveExtractionEdits(id, edits)`, `analyzeExtraction(id)`, and `approveExtraction(id)`.

- [ ] **Step 1: Write the failing test**

~~~ts
expect(fetch).toHaveBeenCalledWith(
  '/api/portal/proxy-post?path=%2Fdocuments%2Fdoc-1%2Fextraction',
  expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ edits: [{ index: 2, text: 'Corrected' }] }) }),
);
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm --filter @lexchain/web test -- app/portal/lib/extraction-api.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Write the minimal implementation**

~~~ts
export type ExtractionReview = ApiSchema<'ExtractionReviewResponse'>;
export function saveExtractionEdits(id: string, edits: ApiSchema<'BlockEdit'>[]) {
  return portalMutation<ExtractionReview>(`/documents/${id}/extraction`, 'PATCH', { edits });
}
~~~

Use one private helper to parse `{ detail?: string; message?: string }` errors. The other calls use `/extraction`, `/extraction/analyze`, and `/extraction/approve` exactly.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `pnpm --filter @lexchain/web test -- app/portal/lib/extraction-api.test.ts`

Expected: PASS.

- [ ] **Step 5: Checkpoint for review**

Run: `git diff --check -- apps/web/app/portal/lib/extraction-api.ts apps/web/app/portal/lib/extraction-api.test.ts`

Expected: no whitespace errors. Leave this task uncommitted until the user explicitly authorizes a commit.

### Task 2: Make mock mode honor the review boundary

**Files:**
- Modify: `apps/web/lib/portal-mock.ts`
- Modify: `apps/web/lib/portal-mock.test.ts`

**Interfaces:**
- Consumes: Task 1 endpoint paths and mock issuer checks.
- Produces: review GET data, persisted PATCH edits, optional analysis flags, and approval responses.

- [ ] **Step 1: Write failing mock tests**

~~~ts
expect((await mockPortalGet('/documents/mock-document-2/extraction', issuerToken)).status).toBe(200);
expect((await mockPortalMutate('POST', '/documents/mock-document-2/extraction/approve', emptyRequest, participantToken)).status).toBe(403);
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm --filter @lexchain/web test -- lib/portal-mock.test.ts`

Expected: FAIL because mock extraction paths do not exist.

- [ ] **Step 3: Write the minimal mock implementation**

Store seeded blocks as `{ index, text, original_text, edited, score, page_idx }` and flags by document. PATCH requires nonempty edits, rejects unknown indexes, changes only `text` and `edited`, and removes corrected-block flags. Analyze replaces only LLM-style flags. Approval rejects empty reviewed text, returns `{ document_id, status, edited_block_count, content_hash, message }`, and does not set `on_chain`.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `pnpm --filter @lexchain/web test -- lib/portal-mock.test.ts`

Expected: PASS, including issuer-only mutations and proof that approval does not anchor a document.

- [ ] **Step 5: Checkpoint for review**

Run: `git diff --check -- apps/web/lib/portal-mock.ts apps/web/lib/portal-mock.test.ts`

Expected: no whitespace errors. Leave this task uncommitted until the user explicitly authorizes a commit.

### Task 3: Build the issuer review workspace

**Files:**
- Create: `apps/web/app/portal/documents/[id]/review/page.tsx`
- Create: `apps/web/app/portal/documents/[id]/review/page.test.tsx`

**Interfaces:**
- Consumes: Task 1 client functions, `portal-profile`, `getPortalUiRole`, and document id.
- Produces: `/portal/documents/:id/review`; successful mutations invalidate `['portal-doc', id]`, `['portal-doc-status', id]`, and `['portal-extraction', id]`.

- [ ] **Step 1: Write failing UI tests**

~~~tsx
expect(screen.getByRole('heading', { name: 'Review extracted text' })).toBeTruthy();
expect(screen.getByText('High priority')).toBeTruthy();
expect(screen.getByLabelText('Extracted text for block 2')).toHaveValue('OCR output');
expect(screen.getByRole('button', { name: 'Approve reviewed text' })).toBeTruthy();
~~~

Also cover participant read-only access, changed-block-only saves, pending semantic analysis, approval confirmation, and failed mutation retention of local edits.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm --filter @lexchain/web test -- app/portal/documents/[id]/review/page.test.tsx`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Write the minimal workspace implementation**

Fetch profile before enabling extraction. Render loading and error states, then an issuer-only responsive three-region grid. Keep draft text by `block.index`, compare it to `block.text` to generate `BlockEdit[]`, use `aria-current` for the selected flag, and label each text area by block index. The approval confirmation says it freezes reviewed text and starts processing; it never claims an on-chain record.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `pnpm --filter @lexchain/web test -- app/portal/documents/[id]/review/page.test.tsx`

Expected: PASS.

- [ ] **Step 5: Checkpoint for review**

Run: `git diff --check -- apps/web/app/portal/documents/[id]/review/page.tsx apps/web/app/portal/documents/[id]/review/page.test.tsx`

Expected: no whitespace errors. Leave this task uncommitted until the user explicitly authorizes a commit.

### Task 4: Connect processing and real finalization

**Files:**
- Modify: `apps/web/app/portal/upload/processing/page.tsx`
- Create: `apps/web/app/portal/upload/processing/page.test.tsx`
- Modify: `apps/web/app/portal/documents/[id]/document-workspace.tsx`
- Modify: `apps/web/app/portal/documents/[id]/document-workspace.test.tsx`
- Modify: `apps/web/app/portal/lib/document-lifecycle-api.ts`

**Interfaces:**
- Consumes: review URL, `DocumentResponse.status`, and `ApiSchema<'RecordResponse'>`.
- Produces: truthful processing copy, review entry point, and finalization output that displays returned hashes.

- [ ] **Step 1: Write failing page and workspace tests**

~~~tsx
expect(screen.getByRole('link', { name: 'Review extracted text' }).getAttribute('href')).toBe('/portal/documents/doc-1/review');
expect(screen.getByText(/This will anchor the approved document hash on-chain/)).toBeTruthy();
~~~

Also assert unknown statuses continue polling, finalization renders returned `data_hash` and `tx_hash`, and a rejection never renders success.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `pnpm --filter @lexchain/web test -- app/portal/upload/processing/page.test.tsx app/portal/documents/[id]/document-workspace.test.tsx`

Expected: FAIL because processing has an invented 2/3 progress bar and the workspace uses demo-only finalization.

- [ ] **Step 3: Write the minimal integration changes**

Remove the hard-coded bar and summary promise. Treat only explicit failure strings as failure; do not map unfamiliar strings to complete. Link to review only when the backend state is review-ready. Replace `finalizeDemoDocument` with `finalizeDocument` returning `RecordResponse`, replace demo copy, render returned transaction/data hashes, and keep finalization hidden unless backend data says it is ready.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `pnpm --filter @lexchain/web test -- app/portal/upload/processing/page.test.tsx app/portal/documents/[id]/document-workspace.test.tsx`

Expected: PASS.

- [ ] **Step 5: Checkpoint for review**

Run: `git diff --check -- apps/web/app/portal/upload/processing/page.tsx apps/web/app/portal/upload/processing/page.test.tsx apps/web/app/portal/documents/[id]/document-workspace.tsx apps/web/app/portal/documents/[id]/document-workspace.test.tsx apps/web/app/portal/lib/document-lifecycle-api.ts`

Expected: no whitespace errors. Leave this task uncommitted until the user explicitly authorizes a commit.

### Task 5: Verify the feature and scope

**Files:** Modify only when validation identifies a defect in Tasks 1-4.

- [ ] **Step 1: Run the focused suite**

Run: `pnpm --filter @lexchain/web test -- app/portal/documents/[id]/review/page.test.tsx app/portal/documents/[id]/document-workspace.test.tsx app/portal/upload/processing/page.test.tsx app/portal/lib/extraction-api.test.ts lib/portal-mock.test.ts`

Expected: PASS.

- [ ] **Step 2: Run static and production checks**

Run: `pnpm --filter @lexchain/web lint && pnpm --filter @lexchain/web build`

Expected: both commands exit 0.

- [ ] **Step 3: Inspect scope before committing**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; stage only planned files and preserve existing dirty work.

- [ ] **Step 4: Hand off the verified uncommitted feature**

Report the scoped diff and test results. Commit only after the user explicitly authorizes the exact files and commit message.

## Self-Review

- Coverage: Tasks 1-2 establish the contract; Task 3 delivers review/edit/analyze/approve; Task 4 connects processing/finalization; Task 5 verifies it.
- Type consistency: edits use `BlockEdit { index, text }`; approval uses `ApproveExtractionResponse`; finalization uses `RecordResponse`.
- Backend status vocabulary stays open because the current OpenAPI contract declares it as `string`.
