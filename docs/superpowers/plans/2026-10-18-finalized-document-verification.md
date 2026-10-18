# Finalized Document Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose verification for viewable finalized documents and link valid transaction hashes to Base Sepolia.

**Architecture:** Keep the current document action, verification page, same-origin request, and `VerifyWorkspace`. Add the lifecycle condition to the existing action owner, keep explorer URL construction in pure verification UI logic, and add a small deterministic Playwright flow using the existing browser stack.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, installed Playwright.

**Spec:** `docs/superpowers/specs/2026-10-18-finalized-document-verification-design.md`

## Global Constraints

- Preserve document access checks and `GET /documents/{document_id}/verify`.
- Keep backend statuses distinct and preserve contradictory-verdict safeguards.
- Keep hashes copyable and show an explorer link only for a valid 32-byte hexadecimal transaction hash.
- State clearly that mock verification is simulated and not real chain evidence.
- Use installed Playwright and visible-state assertions; add no dependencies or fixed sleeps.
- Leave unrelated and ignored files untouched.

## Review Focus

- A finalized, unanchored, viewable document: verify action is present; add a document-action regression assertion.
- A finalized document without view permission: verify action is absent; add a permission regression assertion.
- Lowercase or uppercase `0x`, repeated prefixes, malformed length and non-hex characters: canonical link or no link; pin in the URL helper test.
- Unavailable and not-anchored results: retry remains visible; pin in verification browser test.
- Mock and live modes: simulated label appears only in mock mode; pin in deterministic browser scenarios.

---

### Task 1: Finalized document action and transaction URL

**Files:**
- Modify: `src/features/documents/document-ui.ts`
- Test: `src/features/documents/document-ui.test.ts`
- Modify: `src/features/verification/integrity-ui.ts`
- Test: `src/features/verification/integrity-ui.test.ts`

**Interfaces:**
- Produces: `getBaseSepoliaTransactionUrl(hash: string): string | null` from `integrity-ui.ts`.

- [ ] Add tests that a finalized viewable record with `on_chain: false` has Verify integrity, a finalized non-viewable record does not, and an existing viewable on-chain record retains it.
- [ ] Add tests for no prefix, one prefix, repeated mixed-case prefixes, and malformed hash values (wrong length and non-hex); expect canonical URL or `null`.
- [ ] Run the two focused Vitest files and confirm the new assertions fail before implementation.
- [ ] Update `getDocumentActions` to allow verification when `can_view` and either normalized lifecycle is `FINALIZED` or `on_chain` is true.
- [ ] Implement the pure URL helper; strip repeated leading `0x` prefixes case-insensitively, require 64 hex characters, and return the canonical Base Sepolia URL.
- [ ] Run both focused Vitest files and confirm they pass.
- [ ] Commit as `fix: expose finalized document verification`.

### Task 2: Verification result presentation

**Files:**
- Modify: `src/features/verification/components/verify-workspace.tsx`
- Test: `src/app/portal/documents/[id]/verify/page.test.tsx`

**Interfaces:**
- Consumes: `getBaseSepoliaTransactionUrl(hash: string): string | null` from Task 1.

- [ ] Extend the page test fixture and add assertions that each documented status is shown, unavailable and not-anchored can be retried, and missing/malformed transaction hashes create no explorer link.
- [ ] Add an assertion that a valid hash keeps the existing copy button and renders a canonical Base Sepolia link.
- [ ] Add deterministic mock-mode and live-mode assertions for the simulated-evidence label.
- [ ] Run the focused verification page test and confirm the new assertions fail before implementation.
- [ ] Render the explorer link beside the copyable transaction hash only when the helper returns a URL; retain existing hash copy behavior.
- [ ] Add the simulated-evidence label using the existing lightweight mock-mode flag, without importing mock fixtures or server code into the client bundle.
- [ ] Run the focused verification page test and confirm it passes.
- [ ] Commit as `feat: link verification transactions`.

### Task 3: Deterministic browser journey

**Files:**
- Create: `e2e/document-verification.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `pnpm e2e:document-verification` for the repository's existing browser-check setup.

- [ ] Add a browser scenario that intercepts only the same-origin document and verification responses, loads a finalized document with `on_chain: false`, opens Verify integrity, and asserts all required visible behavior including retry and transaction URL normalization.
- [ ] Cover all five documented backend statuses with deterministic response fixtures, and assert unavailable is never shown as tampering.
- [ ] Run against the local app using the existing `E2E_BASE_URL` convention; require a visible heading and bounded Playwright waits, no fixed sleeps.
- [ ] Confirm the script states that API responses were intercepted and this is mocked frontend evidence.
- [ ] Add the package script and run the browser scenario successfully.
- [ ] Commit as `test: cover document verification in browser`.

### Task 4: Full verification and review

**Files:**
- Review all issue #124 changes.

- [ ] Run `pnpm test -- --run` only if supported by the current script; otherwise run `pnpm test` once.
- [ ] Run `pnpm test:scripts`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
- [ ] Run `pnpm e2e:document-verification` and record its mocked evidence boundary.
- [ ] Review the full branch diff for scope, contract preservation, access behavior, and unrelated files.
- [ ] Create a PR to `dev` with `Closes #124`; after it passes required checks, merge it and fetch the latest `dev` before beginning #125.
