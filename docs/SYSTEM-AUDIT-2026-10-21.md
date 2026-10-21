# LexChain system audit — current architecture and user flow

_Reviewed 2026-10-21._ This is a source-level audit of the active frontend checkout and the current backend source. It separates what the repositories implement from what would need a live environment to prove.

## Evidence and scope

| Repository | Revision checked | Working-tree note |
|---|---|---|
| Frontend `LexChain` | `dev`, `913b4fb4574c0f8fbbc58dc0bd3d8c4283a017f3` | Clean before these documentation updates |
| Backend `lexchain-backend` | `main`, `05f99cfdd5047bd8214fb328fb963b09704e80a2` | Existing local edits and untracked architecture notes were read and preserved |

I traced the mounted FastAPI routers, authentication and document access, invitation handling, document lifecycle, signed-file intake, finalization, processing dispatch, OCR review, retrieval and provider selection. On the frontend I checked the route adapters, role routing, lawyer/client pages, invitation/signup pages, document review gates, and the existing architecture and testing guides. The backend source hash is the reference for the implementation claims below.

This audit did not run tests or a live authenticated browser flow. It did not inspect the deployed database migration head, Supabase bucket policy, environment variables, email delivery, Google OAuth, Redis/Celery/Beat health, or blockchain provider configuration. A source route or migration file is not proof that a deployed system has it enabled or applied.

## Short assessment

The current code has a clear division of responsibility: the Next.js app owns the web/PWA experience and session-cookie adapters; FastAPI owns authentication checks, document access, lifecycle transitions, persistence, and integrations. Lawyers have a preparation path and a direct signed-PDF filing path. Clients get access per document only after accepting a document-party invitation. Finalization and OCR/indexing are separate stages.

The main user-flow mismatch is lawyer account onboarding. The website tells invitees that signup creates a standard account and does not accept an invitation, while backend source can assign and claim a pending lawyer account invitation when a new account signs up with the exact invited email. A different-role existing account is upgraded when the invitation is created. This needs an explicit product decision and matching UI behavior.

The source maps in the frontend are mostly current and useful. The backend's newly added, untracked architecture notes contain an older source snapshot and several claims contradicted by current backend source. I did not edit those backend files.

## Read the flowcharts and route maps

- [Whole-system architecture](ARCHITECTURE.md) — browser/PWA, Next.js routes, FastAPI, access checks, data stores, integrations and processing workers.
- [Lawyer and client flow map](USER-FLOW-ARCHITECTURE.md) — separate role journeys, endpoint tables, invite distinctions, frontend limitations and evidence boundaries.
- [Compact end-to-end use case](lexchain-usecase-flow.md) — one-page lifecycle diagram with both lawyer intake paths.
- [Manual testing guide](MANUAL-TESTING-GUIDE.md) — source-informed scenarios; statuses remain NOT RUN until actually exercised.

## Current architecture

### Frontend and backend boundary

The active frontend is a Next.js App Router application with an installable PWA. Browser API calls normally go to same-origin Next.js handlers; those handlers read the HttpOnly session cookie and forward the backend JWT. Some server-rendered pages and actions call server-only backend helpers directly. A readable role hint can select navigation, but backend authorization is authoritative.

FastAPI mounts feature routers for auth, users, documents and extraction, retrieval, admin, notifications, books and Google. The separate blockchain router is not mounted. Document finalization and verification use document routes. The backend uses async SQLAlchemy/Postgres for records, Supabase Auth for identity, Supabase Storage for files, Google Drive for optional drafts and comments, and Redis/Celery workers for OCR and approved-text enrichment. See `backend/app/main.py:169–177` and `backend/app/features/documents/dispatch.py:23–79` at the checked backend revision.

### Identity, account roles and document access

Backend account roles are `lawyer` and `user`; the frontend's `admin`, `super_admin`, `document_issuer` and `document_participant` values are presentation aliases. A lawyer role alone does not grant access to another lawyer's documents. The owner or an accepted `DocumentParty` can view a given document; pending document-party invitations grant no access. The owner controls filing and lifecycle mutations. Backend authorization is applied per request (`backend/app/features/documents/access.py:41–82`, `backend/app/shared/constants.py:16–27`).

Account-role invitations and document-party invitations are different workflows. Details and the email-match signup path are in the [user-flow guide](USER-FLOW-ARCHITECTURE.md#lawyer-account-invitations-are-not-document-party-invitations).

### Document lifecycle and processing

There are two lawyer intake paths:

1. **Prepare first:** create a `PREPARING` record, optionally create a Google Docs draft, invite an existing account to collaborate, resolve comments, and mark the record `READY_FOR_SIGNATURE`. Signing happens outside LexChain. The lawyer chooses a book and attaches the signed PDF; the attach operation requires a book and transitions the record to `SIGNED`.
2. **Already signed:** upload the signed PDF with its register book and required filing details to create a signed record directly.

Both paths converge on finalization. The backend re-downloads the stored PDF and checks its SHA-256, creates a snapshot, calls the selected blockchain provider, records the extraction dispatch with document state, commits, and then sends the dispatch to the worker queue. OCR saves text and stops at `AWAITING_REVIEW`. The lawyer edits and approves the extraction; enrichment then creates chunks, embeddings and analysis from the approved text. The signed PDF hash and approved-text hash have different purposes. Current lifecycle rules are in `backend/app/features/documents/lifecycle.py:34–50`, `backend/app/features/documents/workflow/intake.py:79–115`, and `backend/app/features/documents/workflow/finalization.py:42–108`; processing is in `backend/app/workers/process_documents.py:35–236`.

Lifecycle state and processing state are separate. A document can be `FINALIZED` while processing is queued, awaiting review, or failed. The owner can retry a failed processing phase through `POST /documents/{document_id}/retry-processing`; the route is present in current source at `backend/app/features/documents/router.py:703–728`.

## Findings

| Priority | Finding | Evidence and user impact |
|---|---|---|
| High — product/security intent | **Account invitation acceptance is inconsistent across layers.** The backend's signup schema does not accept a token. For a new local user, the backend looks up an unexpired pending invitation by exact email, assigns its role and claims it. If an existing user's role differs, the account is changed and the invitation claimed when the invitation is created. An existing account already on the invited role bypasses the new-user lookup. Frontend copy instead says web signup creates a standard account and does not accept the invitation. | Backend: `backend/app/features/admin/service.py:104–174`, `backend/app/features/auth/schemas.py:14–19`, `backend/app/features/auth/service.py:144–154`, `backend/app/features/users/repository.py:61–82`, `backend/app/features/admin/repository.py:21–29`. Frontend: `src/app/invite/[token]/page.tsx:19–53`, `src/features/auth/pages/register-page.tsx:32–52,116–153`. A new invitee may become a lawyer through email matching without token redemption; existing-account behavior is different. This does not grant access to a specific document. |
| Medium — onboarding | **The invitation link's deployed entry point is unverified.** Backend invitation creation emits a `lexchain://sign-up?token=...` link. The web repo has an `/invite/{token}` fallback page, but that page does not change the backend email link and the website signup does not redeem the token. | Backend `backend/app/features/admin/service.py:126`; frontend `src/app/invite/[token]/page.tsx:19–26`. No email delivery, installed-app deep link, or PWA/browser click-through was tested. |
| Medium — documentation | **The backend architecture notes are stale against the checked source.** The untracked guide says it represents `7b694290...`, not current `05f99cf...`; several statements are now false. | In `lexchain-backend/backend/docs/architecture/`: `api-contract.md:37` and `processing-and-retrieval.md:47` say there is no source retry handler; `document-lifecycle.md:35` shows signed-copy attach from `PREPARING`; `lawyer-and-client-flows.md:32` describes `/entry` as initial assignment. Current source has retry, allows attach from `READY_FOR_SIGNATURE`, and uses `/entry` to correct/reassign an existing signed record. These local backend docs were preserved without edits. |
| Medium — deployment readiness | **The processing-dispatch migration must be confirmed in the deployed database.** The backend source contains migration `backend/migrations/versions/b9d4f6a20c53_feat_processing_dispatches.py`, but a pre-existing backend scratch note records an earlier `processing_dispatches` missing-table error and explicitly leaves current migration state unverified. | No database was queried. Verify the deployed Alembic revision before relying on finalization and the retry relay. The scratch note is a lead to recheck, not evidence of a current outage. |
| Medium — processing reliability | **Worker notification enqueue is inside processing exception handling after data has committed.** In extraction, the status and OCR data commit before `handle_document_processed.delay(...)`; if that enqueue raises, the broad handler can mark the record `FAILED` even though the extraction commit succeeded. Enrichment similarly queues its completion notification inside the broad processing `try` after completion is committed. | `backend/app/workers/process_documents.py:92–123,190–236,521–535`. This is a source-level failure path; it was not failure-injected. Separate notification failures from the document-processing outcome or make the status repair/idempotency path explicit. |
| Medium — integrity/recovery | **The Web3 transaction precedes the finalization database commit.** When Web3 is selected, the provider can mine an anchor and the later SQL commit can still fail, leaving an external anchor without the corresponding finalized document state. The current factory selects Web3 only for `ENVIRONMENT == "development"`. | `backend/app/features/documents/workflow/finalization.py:68–91`; `backend/app/features/blockchain/dependencies.py:7–11`. No compensation or failure injection was checked. Confirm provider idempotency and provide a reconciliation path before treating finalization as atomic across both systems. |
| Medium — capability mismatch | **Accepted clients can read extraction data through the backend API, but the current frontend hides the review page from non-lawyers.** The API GET uses document view access; the frontend enables the extraction query and review workspace only for the lawyer role. | Backend `backend/app/features/documents/extraction/service.py:52–85,236–268`; frontend `src/features/documents/pages/documents-id-review-page.tsx:41–47,81–87`. A client has no extraction review screen in this web flow; whether API read access is intended should be clear in the product's confidentiality rules. |
| Medium — integrity claims | **Current source does not establish real production blockchain anchoring.** The provider factory selects Web3 only when `ENVIRONMENT == "development"` and otherwise selects the mock provider. | `backend/app/features/blockchain/dependencies.py:7–11`. No deployment environment values or transaction receipts were checked. Confirm this selection rule matches the intended deployment before describing a production record as on-chain. |
| Low — route support | **Some frontend routes target backend operations that are not mounted.** Document/admin audit-log routes have no matching mounted operation, and the standalone blockchain router is commented out. The valid integrity flow is document finalize, then document verify. | `backend/app/main.py:169–177`; `backend/app/features/documents/router.py`; frontend targets are listed in `USER-FLOW-ARCHITECTURE.md` under unsupported paths. The current flow guide already calls this out. |

## Frontend/backend documentation alignment

- The current [architecture](ARCHITECTURE.md) and [user-flow guide](USER-FLOW-ARCHITECTURE.md) correctly describe the proxy boundary, backend role authority, both lawyer intake paths, the separated lifecycle/processing stages, unsupported audit-log targets, local/demo office pages, and unavailable e-copy request screens.
- The compact use-case diagram now includes both document-party acceptance and lawyer account invitations. Its main lawyer and client journeys are still expanded in the role-specific guide rather than duplicated here.
- The manual guide previously marked invited-lawyer signup `BLOCKED` and repeated the standard-account claim. That instruction has been corrected to reflect current source behavior; it remains a test procedure, not a completed runtime test.
- The invite and registration **UI copy itself remains inaccurate** for same-email lawyer onboarding. It should be reconciled after the product decides whether invitations are explicit-token acceptance or email-match role assignment.
- `lexchain-backend/CODEBASE.md` labels its lifecycle flow historical. Keep that warning and use the mounted current backend source for lifecycle claims.
- `docs/BACKEND-FRONTEND-INTEGRATION-AUDIT.md` is dated 2026-10-08 and should be treated as a historical snapshot. This audit and the 2026-10-21 flow guide supersede it for current flow documentation.

## Recommended follow-up

1. Decide whether a lawyer account invitation grants the role immediately, grants it on matching-email signup, or requires explicit token acceptance. Then align the backend, website copy, invitation email/link, and tests with one rule.
2. Verify the real invitation click path from delivered email on browser/PWA and installed mobile clients; record which route handles `lexchain://` and what happens when the app is absent.
3. Check the deployed Alembic head, bucket access, mail, Google OAuth, broker/worker/Beat processes, and blockchain provider configuration. Confirm the complete lifecycle in an authorized test environment.
4. Make notification delivery independent of committed extraction/enrichment outcomes and make finalization recoverable when the external provider and SQL commit disagree.
5. Refresh the backend architecture pages to the current source SHA and correct the lifecycle, retry, register assignment and invitation details before using them for implementation.

No live workflow or test suite was run for this audit. Provider, migration, storage, mail, worker and client deep-link behavior can differ from source until they are checked in the target environment.
