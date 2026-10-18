# Signed PDF finalization and OCR review design

**Issue:** [#122 Align finalization, OCR review and demo behavior with signed-PDF anchoring](https://github.com/agustinelumandong/LexChain/issues/122)

**Parent:** [#114 Align frontend document workflows with the backend handoff](https://github.com/agustinelumandong/LexChain/issues/114)

## Goal

Finalize and anchor the signed PDF when backend permissions allow it, then let backend processing drive OCR review and later search. Extraction approval controls searchable text only; it must not gate finalization or change the signed-PDF fingerprint.

## Evidence and contract boundary

- The checked-in OpenAPI defines a bodyless `POST /documents/{document_id}/finalize`, permitted only from `SIGNED`. Its `RecordResponse` supplies `document_id`, `tx_hash`, `onchain_document_id`, and `data_hash`.
- `GET /documents/{document_id}` exposes lifecycle, processing status, `permissions.can_finalize`, signed-copy metadata, and `document_hash`. The schema describes that hash as the signed-copy hash anchored at finalization. It does not expose transaction fields.
- Extraction approval returns a separate `content_hash`. Editing or approving extraction must not change the signed PDF or its anchored hash.
- Neither the OpenAPI nor checked-in frontend contract documents idempotency or safe retry for finalization. A GET returning `SIGNED` after a lost response does not prove that another POST is safe.
- These are frontend/OpenAPI findings. No live backend, chain, or cryptographic behavior is proven here.

## Current behavior

- The detail page already gates Finalize using the lawyer UI role and backend `permissions.can_finalize`; it does not require extraction approval.
- Confirmation text still describes anchoring an approved document hash. The dialog is only rendered on the Overview tab.
- Successful finalization retains and displays the actual `RecordResponse`, but does not invalidate the document-list query.
- A network error leaves the dialog retryable. There is no outcome-unknown state or status reconciliation.
- The mock requires reviewed extraction before finalization and uses extraction text as the document hash. Mock search and Ask do not use reviewed extraction or processing readiness. Mock fingerprints and chain results are synthetic.
- Processing status is fetched separately and completion can leave detail, list, and search caches stale. One floating mock chatbot bypasses the Ask API and returns random canned answers.

## Design

### Finalization and returned chain result

- Keep the existing backend `permissions.can_finalize` as the source for showing Finalize, alongside the lawyer UI-role restriction. Do not add an extraction-approval prerequisite.
- Keep the existing confirmation and mutation. Use the issue-approved copy: “This freezes the signed copy and records its fingerprint on the blockchain. It cannot be undone.” Make the pending state explain that finalization is waiting for the chain; keep duplicate submission disabled while the request is pending.
- On success, retain and display every actual field returned by `RecordResponse`. Invalidate the document detail, document list, and history queries without clearing the displayed result. Do not derive transaction data from `DocumentResponse`.
- Keep chain/finalization failure distinct from a document whose finalization succeeded but whose subsequent processing failed.
- Render confirmation and result feedback at the detail-page level so opening Finalize remains visible regardless of the selected workspace tab.

### Lost response and reconciliation

- Treat transport timeout, connection loss, or an unusable response after submission as an unknown outcome; do not automatically repeat the finalize POST.
- Store an unknown-outcome latch in `sessionStorage`, scoped to the document ID and browser tab. It survives a refresh in that tab and is cleared when the tab closes. The selected behavior explicitly does not persist across browser restarts.
- While latched, block Finalize and offer **Check status**, which performs only `GET /documents/{id}`.
- If the GET reports `FINALIZED`, update document state and refresh relevant queries, but show no transaction/hash result unless it came from the original POST response.
- If the GET reports `SIGNED`, or the GET is unavailable/ambiguous, preserve the unknown state and keep Finalize blocked. Explain that status is inconclusive and provide a retryable Check status action. Never infer retry safety from `SIGNED` and never issue a second finalize POST automatically.
- A normal, explicit backend rejection response remains a recoverable error and is presented using the existing error handling. It does not become an unknown result unless the client cannot establish whether the server accepted the POST.

### OCR, review, processing, search, and Ask

- Begin OCR/analysis processing only from backend responses after finalization. Keep status and progress response-driven; do not add client timers or a simulated processing queue.
- Preserve extraction GET/PATCH/analyze/approve request contracts, noneditable blocks, unsaved-edit handling, and existing conflict behavior.
- Treat the signed-PDF fingerprint and approved extraction `content_hash` as separate values. Saving, analyzing, or approving text may update extraction data but must leave signed-copy metadata and the displayed finalization record unchanged.
- Refresh detail/list/history/search state when the existing response flow establishes a meaningful change. The processing page continues to poll backend status; when it reaches a terminal completion/review/failure state, invalidate the corresponding cached document and search data so a return to those views does not rely on stale state.
- Route the deterministic browser journey through the real Ask API path; do not use the random floating mock chatbot as proof that reviewed text is searchable.

### Demo behavior and proof limits

- Reconcile demo permissions and lifecycle order so a signed document can be finalized without approved extraction, followed by extraction review and completion.
- In demo data, keep the signed-PDF fingerprint stable through extraction edits and distinct from the extraction `content_hash`. Label demo hashes/results as synthetic wherever shown; do not claim they prove PDF hashing, signatures, or blockchain anchoring.
- Use deterministic browser route fixtures for the queued/processing/review/completion journey and failures. Do not build a new mock processing queue or make the live UI synthesize backend progress.
- Keep explicitly unsupported external operations visible as unsupported. Do not convert unsupported operations into apparent success or cryptographic proof.

## User-visible states

1. **Signed and eligible:** Finalize appears from backend permission; confirmation states the irreversible signed-copy anchoring action.
2. **Finalizing:** one submission is pending; duplicate confirmation is disabled and chain wait is explained.
3. **Finalized:** returned chain result is shown when the POST returned it; detail/list/history refresh.
4. **Finalization outcome unknown:** no blind resubmission; Check status performs GET only. A `FINALIZED` GET updates document state without inventing transaction data. `SIGNED` or unavailable status remains locked and explains the uncertainty.
5. **Processing/review/completion:** UI follows actual backend status; extraction review edits only searchable text.
6. **Processing failed after finalization:** show the processing failure separately from the successful finalization result.
7. **Demo:** workflow fixtures may advance deterministically, but synthetic hashes and unsupported operations are identified as such.

## Verification design

- Focused component/API tests cover permission gating, required wording, pending duplicate protection, retained actual chain result, success cache invalidation, and confirmation visibility from non-Overview tabs.
- Reconciliation tests cover GET returning `FINALIZED`, `SIGNED`, and unavailable/ambiguous; assert there is no second finalize POST, that unknown state survives refresh within the tab, and that `SIGNED` does not unlock finalization.
- Mock tests cover signed-to-finalized transition before extraction approval, stable signed-PDF fingerprint across extraction edits/approval, separate extraction hash, response-driven processing state, and reviewed-text search/Ask behavior while preserving access scoping.
- A deterministic browser test covers signed -> finalize once -> review/completion -> search/Ask, compares the signed-PDF fingerprint before and after text edits, and distinguishes chain failure from processing failure. Browser fixtures are not evidence of live backend or blockchain behavior.

## Explicit non-goals

- No backend endpoint, idempotency key, retry guarantee, or transaction lookup is invented.
- No extraction approval before finalization.
- No frontend-generated processing progression, blockchain proof, PDF cryptographic verification, or external-operation success simulation.
- No persistence of unknown outcome across browser restarts.

## Research notes

Source audit artifacts for this design are in the ignored `.superpowers/issue-122-research/` directory in the issue worktree. The contract audit, UI-flow audit, mock audit, and GitHub issue #122 were reviewed before writing this spec. These notes are research aids, not tracked product documentation.
