# Lawyer Integrity & Processing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` task-by-task. Steps use checkbox syntax.

**Goal:** Give the Lawyer safe visibility into verification results, blockchain records, and processing outcomes.

**Architecture:** Build portal pages around `POST /blockchain/record/{document_id}` and `GET /blockchain/verify/{document_id}`. Define a processing-status contract before showing a monitor.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind, Vitest, OpenAPI types.

## Global Constraints

- Results are only Match, Mismatch, or No Record.
- Never claim legal validity, truthfulness, fraud, or enforceability.
- Blockchain records are read-only; no keys, wallet, anchoring, or finalization controls.
- Processing and blockchain state remain separate.

---

### Task 1: Add integrity route handlers

**Files:** Create `app/api/portal/blockchain/record/[id]/route.ts`, `app/api/portal/blockchain/verify/[id]/route.ts`, `app/portal/lib/integrity-api.ts`; test `app/api/portal/blockchain/record/[id]/route.test.ts`.

- [ ] Write failing route tests for `401` without a token and correct upstream path with a token.
- [ ] Run the focused test; expect handler-not-found failure.
- [ ] Implement a `POST` record handler (no request body) and a `GET` verify handler, plus typed `getBlockchainRecord(id)` and `verifyRepositoryDocument(id)` helpers.
- [ ] Run focused/full tests and lint. Commit `feat(portal): add integrity route handlers`.

### Task 2: Build Verification Center

**Files:** Create `app/portal/verification/page.tsx`, `app/portal/components/integrity-result.tsx`, `app/portal/lib/integrity-ui.ts`; test `app/portal/lib/integrity-ui.test.ts`.

- [ ] Write failing tests for result labels and the required integrity-only safety message.
- [ ] Implement repository verification with Match, Mismatch, and No Record cards using only returned fields.
- [ ] Do not retain uploaded public files or offer a legal conclusion.
- [ ] Run focused/full tests and lint. Commit `feat(portal): add verification center`.

### Task 3: Build Blockchain Records

**Files:** Create `app/portal/blockchain-records/page.tsx`, `app/portal/components/blockchain-record-card.tsx`; test `app/portal/lib/blockchain-record-ui.test.ts`.

- [ ] Write a failing test that no record renders `No anchored record` and no anchor action.
- [ ] Implement read-only transaction, hash, network, anchored-at, and document-link presentation.
- [ ] Add navigation after the page exists. Run focused/full tests and lint. Commit `feat(portal): add blockchain records`.

### Task 4: Add Processing Monitor

**Files:** Modify `openapi-updated.json`; create `app/api/portal/processing/[id]/route.ts`, `app/portal/processing/page.tsx`, `app/portal/lib/processing-ui.ts`; test `app/portal/lib/processing-ui.test.ts`.

- [ ] Add `GET /documents/{document_id}/processing-status` returning `{ stage, status, started_at, error_message }`; regenerate types.
- [ ] Write failing tests for stage labels and failed status showing only server-provided reason.
- [ ] Implement queued, processing, completed, and failed display with document links; no invented retry operation.
- [ ] Run generation, tests, lint, build. Commit `feat(portal): monitor document processing`.
