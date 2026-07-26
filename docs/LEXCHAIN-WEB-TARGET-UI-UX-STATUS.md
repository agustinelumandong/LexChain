# LexChain Web Target UI/UX Status

Date: 2026-07-26
Branch: `feat/web-target-ui-ux`
Implementation HEAD reviewed: `ba499f2b4b8247bb63673d8336c9c041c4ac4e39`

## Verification snapshot

- `pnpm --filter @lexchain/web test` — passed (`51` files, `266` tests)
- `pnpm --filter @lexchain/web lint` — passed
- `pnpm --filter @lexchain/web build` — passed
- `git diff --check` — passed
- `git diff --name-only -- apps/mobile openapi-updated.json packages/types/src/generated/schema.ts` — no output
- Target-copy scan from the Task 7 brief — no matches

The web branch now covers the target UI/UX flow with honest demo behavior. The
current implementation is suitable for web review in mock mode, but production
completion still depends on backend work captured in
`docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`.

## Walkthrough summary

### Document Issuer

- Forgot Password and Reset Password are available on the web and behave as demo
  flows in mock mode.
- A completed draft can be finalized from the document workspace.
- Finalization now updates the same-runtime audit trail, snapshot history, hash,
  and anchor state in mock mode.
- A seeded mismatch document now exposes Restore with a reason flow in mock
  mode.
- Reports, Processing, Blockchain Records, and Analytics all read from the same
  shared demo document state. The walkthrough showed 4 completed documents, 2
  integrity matches, and 2 on-chain records.

### Admin

- Admin sign-in now routes to `/admin/dashboard`.
- `/admin` access is now bound to server-issued admin authentication rather than
  the writable role cookie.
- Admin user edits, suspend/reactivate actions, and report generation are
  available as demo interactions and show reset-on-refresh behavior.

### Participant

- Participant sign-in still routes to the portal workspace.
- Finalize, Restore, issuer-only activity, issuer reports, processing,
  blockchain records, and analytics remain hidden or denied for participants.
- Shared documents, search, requests, and notifications remain available.
- Rejecting a pending document invitation removes it without granting document
  access. The rejected document stays denied with HTTP 403, and its integrity
  lookup returns a non-disclosing HTTP 404.

## Status matrix

| Actor | Target use case | Web route | Web UI status | Production dependency |
| --- | --- | --- | --- | --- |
| Document Issuer | Sign in | `/login` | Already implemented | Real authentication and role authority must remain server-backed. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Issuer / Participant | Forgot password and reset password | `/forgot-password`, `/reset-password` | Ready for web UI review | Real email delivery, token issuance, token validation, password update, and audit trail. See [password recovery](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#22-password-recovery). |
| Document Issuer | Review a completed draft and finalize it | `/portal/documents/[id]` | Ready for web UI review | Real finalize workflow, persistence, and final-state enforcement. See [atomic document finalization](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#23-atomic-document-finalization). |
| Document Issuer | Inspect document activity | `/portal/documents/[id]/activity` | Ready for web UI review | Real audit-log persistence and authorization. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Issuer | Restore from mismatch/snapshot history | `/portal/documents/[id]` | Ready for web UI review | Real snapshot restore endpoint, validation, and audit trail. See [snapshot listing and restoration](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#24-snapshot-listing-and-restoration). |
| Document Issuer | Generate office reports | `/portal/reports` | Ready for web UI review | Real report queries, exports, and server-generated files. See [fixed reports](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#27-fixed-reports). |
| Document Issuer | Review processing state | `/portal/processing` | Ready for web UI review | Real processing pipeline status and retry/error semantics. See [backend target handoff](LEXCHAIN-BACKEND-TARGET-HANDOFF.md). |
| Document Issuer | Review blockchain records | `/portal/blockchain-records` | Ready for web UI review | Real blockchain verification/record services and failure handling. See [integrity verification response](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#25-integrity-verification-response). |
| Document Issuer | Review office analytics | `/portal/analytics` | Ready for web UI review | Real analytics aggregation and date-range queries. See [backend target handoff](LEXCHAIN-BACKEND-TARGET-HANDOFF.md). |
| Admin | Sign in to admin workspace | `/login`, `/admin/dashboard` | Ready for web UI review | Real admin auth/session enforcement beyond mock/demo UI. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Admin | Edit, suspend, and reactivate users | `/admin/users` | Ready for web UI review | Real user-management endpoints, validations, and audit logging. See [admin user management](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#26-admin-user-management). |
| Admin | Generate fixed system reports | `/admin/generated-reports` | Ready for web UI review | Real report data, exports, and server-side generation. See [fixed reports](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#27-fixed-reports). |
| Participant | Sign in to shared workspace | `/login`, `/portal/dashboard` | Already implemented | Real participant auth/session enforcement remains backend-owned. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Participant | View shared documents without issuer controls | `/portal/documents`, `/portal/documents/[id]` | Ready for web UI review | Real backend authorization on document scope and lifecycle actions. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Participant | Accept or reject document invitations | `/portal/invitations` | Ready for web UI review | Real invitation persistence and document-scope authorization. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Participant | Search, requests, and notifications | `/portal/search`, `/portal/requests/my`, `/portal/notifications` | Already implemented | Production data sources and permissions remain backend-owned. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Public visitor | Verify a document | `/verify` | Already implemented | Production verification remains connected through the public verifier backend contract. See [integrity verification response](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#25-integrity-verification-response). |
| Mobile actor flows | Camera capture, mobile-native upload, mobile verification, and native account flows | `N/A — apps/mobile` | Deferred to mobile phase | Mobile implementation remains out of scope for this web-only branch. |

## Notes

- `/admin/roles-permissions` still exists as a legacy route, but the web target
  flow no longer exposes it from user management.
- The current branch intentionally keeps demo honesty: no screen claims that
  password reset, finalization, restoration, reports, blockchain actions, or
  analytics are production-connected when they are still backed by mock data.
- The only non-blocking verification noise is the existing Next.js
  worktree/multiple-lockfile root warning during `next build`.
