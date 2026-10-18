# Signed PDF finalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align finalization, OCR review, demo behavior, and recovery with the signed PDF as the anchored artifact.

**Architecture:** Keep backend lifecycle and permissions authoritative. The document detail page owns finalization confirmation, the returned chain record, and the tab-scoped unknown-outcome latch; existing extraction APIs and processing-status polling remain in place. Demo fixtures model the same ordering without claiming cryptographic or blockchain proof.

**Tech Stack:** Next.js App Router, React, TypeScript, TanStack Query, Vitest, existing route-intercepted browser E2E scripts, and pnpm.

**Spec:** `docs/superpowers/specs/2026-10-17-signed-pdf-finalization-design.md`

## Global Constraints

- Use Node 24.12.0 or newer and pnpm 11.13.0.
- Preserve backend request methods, payloads, response shapes, error statuses, cookies, and generated types.
- Do not add backend retry/idempotency contracts, frontend processing simulations, or cryptographic/blockchain claims.
- Keep the signed-PDF fingerprint separate from extraction `content_hash`.
- Preserve lawyer role and backend `permissions.can_finalize` gating; extraction approval is not a finalization prerequisite.
- Keep unknown outcome only in tab-scoped `sessionStorage`; never automatically repeat finalization.
- Preserve unrelated and ignored user changes; commit only this issue's files.

## Review Focus

- A lost or ambiguous finalize result followed by `SIGNED` must not permit another POST. Test session refresh, unavailable GET, and no duplicate POST.
- A GET reporting `FINALIZED` must update lifecycle without inventing transaction details. Test absent record fields explicitly.
- Extraction edits and approval must not mutate signed-copy metadata or the finalization record. Test fingerprint equality and distinct extraction hash.
- Pending, chain failure, and post-finalization processing failure must remain distinguishable. Test user-visible messages and controls.
- Demo and browser fixtures must not be mistaken for real cryptography/chain proof, and access scoping must remain enforced. Test disclosure and existing participant scoping.

---

## File Map

- `src/features/documents/pages/documents-id-page.tsx`: owns finalization state, tab-scoped unknown outcome, reconciliation GET, and query invalidation.
- `src/features/documents/pages/documents-id-page.test.tsx`: verifies permission, pending/success/error states, unknown outcome, reconciliation, and no blind retry.
- `src/features/documents/components/document-workspace.tsx`: confirmation/result placement and exact signed-copy wording.
- `src/features/documents/components/document-workspace.test.tsx`: confirmation copy, accessibility, pending state, and visibility across tabs.
- `src/features/documents/pages/upload-processing-page.tsx`: publish terminal backend processing state to existing document/search caches.
- `src/lib/mocks/portal.ts`: mock signed lifecycle, separate signed-PDF and extraction hashes, and reviewed-text search/Ask behavior.
- `src/lib/mocks/portal.test.ts`: mock lifecycle, hash invariance, search/Ask behavior, and access-scoping regression coverage.
- `e2e/signed-pdf-finalization.mjs`: deterministic browser journey using route fixtures for API states and lost-response reconciliation.
- `package.json` or E2E documentation only if needed to expose the new browser script through the existing project convention; do not add dependencies.

## Task 1: Correct finalization confirmation and feedback placement

**Files:**
- Modify: `src/features/documents/components/document-workspace.tsx`
- Modify: `src/features/documents/components/document-workspace.test.tsx`
- Modify: `src/features/documents/pages/documents-id-page.tsx`
- Test: `src/features/documents/pages/documents-id-page.test.tsx`

**Interfaces:**
- Consumes: existing `RecordResponse`, `document.permissions.can_finalize`, and finalization callbacks.
- Produces: confirmation/result rendered at the detail-page level for all workspace tabs; no new API interface.

- [ ] **Step 1: Add failing tests** asserting the required copy (“This freezes the signed copy and records its fingerprint on the blockchain. It cannot be undone.”) and visibility when a non-Overview tab is selected. Retain the existing pending-state test that asserts duplicate confirmation is disabled.
- [ ] **Step 2: Run focused tests and confirm the new copy/tab assertions fail** with the current wording and Overview-only dialog placement.
- [ ] **Step 3: Move or compose the existing confirmation and result at the detail-page owner.** Preserve role + `can_finalize` permission gating, callback behavior, keyboard/accessibility semantics, and every actual `RecordResponse` field. Show chain-wait copy while pending.
- [ ] **Step 4: Run focused document-workspace and detail-page tests** and confirm the confirmation is visible from every tab and pending disables duplicate submission.
- [ ] **Step 5: Commit** as `fix: clarify signed PDF finalization confirmation`.

## Task 2: Reconcile ambiguous finalization outcomes safely

**Files:**
- Modify: `src/features/documents/pages/documents-id-page.tsx`
- Modify: `src/features/documents/pages/documents-id-page.test.tsx`
- Reuse: existing `src/features/documents/document-lifecycle-api.ts` and query keys in document detail/list/history modules.

**Interfaces:**
- Consumes: `finalizeDocument(id)`, the existing `getJson<DocumentResponse>(`/documents/${id}`)` detail fetch, and existing lifecycle query keys.
- Produces: a document-scoped `sessionStorage` latch key `portal-finalize-unknown:<documentId>`; a Check status action that issues GET only; a displayed original `RecordResponse` only when the finalize POST returned it.

- [ ] **Step 1: Add failing tests** for (a) network timeout then GET `FINALIZED`, (b) timeout then GET `SIGNED`, (c) timeout then unavailable GET, and (d) reload within the same tab with the latch set. Assert no second finalize POST in all reconciliation cases; `SIGNED` and unavailable remain locked; `FINALIZED` updates lifecycle without fabricated tx/hash fields.
- [ ] **Step 2: Run the detail-page tests and confirm the reconciliation cases fail** because no latch or status action exists.
- [ ] **Step 3: Implement unknown-outcome classification and tab-scoped persistence.** Set the latch when no conclusive finalize response is available (network/timeout and ambiguous server failures); keep explicit contract rejections as recoverable errors. On mount, restore the latch from `sessionStorage`. Check status performs only GET. Clear the latch only after GET confirms `FINALIZED`; retain it for `SIGNED` or unavailable/ambiguous responses. Do not auto-retry.
- [ ] **Step 4: Invalidate `portal-doc`, `portal-documents`, and `portal-document-history` after successful finalize or a GET confirming `FINALIZED`, preserving any original POST `RecordResponse` already displayed.** Do not synthesize chain fields when reconciliation only provides `DocumentResponse`.
- [ ] **Step 5: Run focused detail-page tests** and confirm all reconciliation/no-repeat assertions pass, including refresh restoration.
- [ ] **Step 6: Commit** as `fix: reconcile unknown finalization outcomes`.

## Task 3: Keep signed-copy identity separate from extraction review

**Files:**
- Modify: `src/lib/mocks/portal.ts`
- Modify: `src/lib/mocks/portal.test.ts`
- Modify if needed: `src/features/documents/pages/upload-processing-page.tsx`
- Add or modify focused tests for processing cache updates in the owning page test file.

**Interfaces:**
- Consumes: current mock document/extraction records and backend-shaped finalize/extraction routes.
- Produces: demo finalization from a signed document without approved extraction; stable synthetic signed-copy fingerprint independent of extraction; search/Ask that can use reviewed text while preserving existing access scoping.

- [ ] **Step 1: Add failing mock tests** for SIGNED -> finalize before extraction approval, repeat/transition behavior from current mock contract, unchanged signed-copy fingerprint and PDF metadata after save/analyze/approve, separate extraction `content_hash`, reviewed-text search/Ask, and existing participant access scoping.
- [ ] **Step 2: Run the focused mock tests and confirm they fail** on the current approval prerequisite and text-derived `document_hash` behavior.
- [ ] **Step 3: Update the smallest existing mock handlers/state transitions** to reflect finalization before OCR approval. Keep the signed fingerprint stable and clearly synthetic; never use the extraction hash as the PDF/chain hash. Make text search and Ask read only approved/searchable text according to current fixture state, without exposing inaccessible documents.
- [ ] **Step 4: Invalidate or publish existing document/list/history/search query data when processing reaches terminal backend status.** Do not add simulated processing timers or a mock queue; preserve the existing status polling endpoint as the source of processing state.
- [ ] **Step 5: Run `pnpm test -- src/lib/mocks/portal.test.ts` and focused processing-page tests**; confirm finalization order, hash invariance, search/Ask, and access tests pass.
- [ ] **Step 6: Commit** as `fix: align demo finalization with signed PDF lifecycle`.

## Task 4: Add deterministic browser acceptance coverage

**Files:**
- Create: `e2e/signed-pdf-finalization.mjs`
- Reuse: `e2e/signed-filing.mjs` route-fixture patterns and existing test setup.
- Modify: E2E documentation or `package.json` only if the repository requires an explicit command for discovery.

**Interfaces:**
- Consumes: API routes from Tasks 1–3 and deterministic response fixtures for document detail, finalize, extraction, processing status, search, and Ask.
- Produces: one repeatable browser journey and explicit mock/demo proof labels.

- [ ] **Step 1: Write the browser assertions** for a SIGNED fixture, exact confirmation wording, pending disabled state, a single finalize POST, actual returned chain result, response-driven review/completion, extraction edit/approval, search and Ask, and unchanged signed fingerprint throughout.
- [ ] **Step 2: Add route fixtures** that hold/release the finalize response and return backend-shaped queued, review, completion, and failure states. Add a lost-response fixture followed by GET `SIGNED` and assert Check status never repeats the POST.
- [ ] **Step 3: Run the browser journey against the local app** using the repository's documented browser setup. Expected result: all assertions pass deterministically; no live backend or blockchain is contacted.
- [ ] **Step 4: Commit** as `test: cover signed PDF finalization journey`.

## Task 5: Final review and verification

**Files:**
- Review all changes from Tasks 1–4.

- [ ] **Step 1: Run relevant focused tests**, then `pnpm test`, `pnpm test:scripts`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` from the repository root.
- [ ] **Step 2: Run the deterministic signed-PDF browser script** and record whether it was exercised against local route fixtures.
- [ ] **Step 3: Review the final diff** for the exact issue scope, unchanged generated API types, preserved permissions and API contracts, no duplicate finalize call, no transaction data invented from GET, no accidental sensitive data, and no unrelated changes.
- [ ] **Step 4: Commit any final scoped fixes** and leave the branch ready for a PR to `dev` that closes #122. Do not push to or target `main`.

## Execution Notes

- Recommended execution approach: `superpowers:subagent-driven-development`, because mock, detail lifecycle/reconciliation, and deterministic browser coverage are separable after their interfaces are fixed by this plan. Keep the plan/worktree as the coordination point and avoid overlapping file edits.
- The existing issue worktree is already isolated on `feature/issue-122-signed-pdf-finalization` from current `origin/dev`.
- No live backend, hosting environment, signature verification, or blockchain proof is part of local verification.
