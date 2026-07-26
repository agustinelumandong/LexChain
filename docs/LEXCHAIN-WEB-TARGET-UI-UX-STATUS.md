# LexChain Web Target UI/UX Status

Date: 2026-07-26
Branch: `feat/two-actor-portal`

## Verification state

- **Pending final verification.** The current web test suite has migration
  failures, so it is not reported as green here.
- Lint, production build, real-browser acceptance, and the two-account mock
  acceptance have not been rerun after the final migration and Task 7 work.
- Task 6 documentation validation is current: the actor terminology scan is
  clean and `git diff --check` passes for this documentation change.
- Final browser acceptance must use the canonical issuer and participant
  accounts, verify both portal sessions and logout cleanup, verify all five
  issuer System Management destinations, and deny every issuer-only route to
  the participant.

The target UI/UX documentation is aligned, but final web readiness is pending
the checks above and backend work captured in
`docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`.

Mock acceptance uses `issuer@example.com` (`document_issuer`) and
`participant@example.com` (`document_participant`), both with `Password123`.

## Intended walkthrough pending final verification

### Document Issuer

- Target mock-mode flows include Forgot Password, Reset Password, finalization,
  restoration with a reason, and the related audit, snapshot, hash, and anchor
  state.
- Reports, Processing, Blockchain Records, and Analytics must read from the
  same shared demo document state.

### Document Issuer System Management

- Every Document Issuer signs in through `/login` and enters the `/portal`
  workspace.
- The **System Management** group exposes User Accounts, Issuer Invitations,
  System Reports, Audit Logs, and System Statistics under `/portal/*` routes.
- Both authenticated actors receive a server-issued `portal_token`; only the
  Document Issuer receives the additional `issuer_token` for issuer-only routes.
- Logout clears portal_token, issuer_token, and any stale issuer cookie. A
  client-readable role hint is not authorization.
- User edits, suspend/reactivate actions, and report generation must remain
  honest mock-mode interactions that reset on refresh.

### Document Participant

- Document Participant sign-in must route to the portal workspace with
  portal_token but no issuer_token.
- Finalize, Restore, issuer-only activity, issuer reports, processing,
  blockchain records, and analytics must be hidden or denied for participants.
- Shared documents, search, requests, and notifications remain participant
  workflows, subject to final verification.

## Status matrix

| Actor | Target use case | Web route | Web UI status | Production dependency |
| --- | --- | --- | --- | --- |
| Document Issuer | Sign in | `/login` | Pending final verification | Real authentication and role authority must remain server-backed. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Issuer / Participant | Forgot password and reset password | `/forgot-password`, `/reset-password` | Pending final verification | Real email delivery, token issuance, token validation, password update, and audit trail. See [password recovery](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#22-password-recovery). |
| Document Issuer | Review a completed draft and finalize it | `/portal/documents/[id]` | Pending final verification | Real finalize workflow, persistence, and final-state enforcement. See [atomic document finalization](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#23-atomic-document-finalization). |
| Document Issuer | Inspect document activity | `/portal/documents/[id]/activity` | Pending final verification | Real audit-log persistence and authorization. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Issuer | Restore from mismatch/snapshot history | `/portal/documents/[id]` | Pending final verification | Real snapshot restore endpoint, validation, and audit trail. See [snapshot listing and restoration](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#24-snapshot-listing-and-restoration). |
| Document Issuer | Generate office reports | `/portal/reports` | Pending final verification | Real report queries, exports, and server-generated files. See [fixed reports](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#27-fixed-reports). |
| Document Issuer | Review processing state | `/portal/processing` | Pending final verification | Real processing pipeline status and retry/error semantics. See [backend target handoff](LEXCHAIN-BACKEND-TARGET-HANDOFF.md). |
| Document Issuer | Review blockchain records | `/portal/blockchain-records` | Pending final verification | Real blockchain verification/record services and failure handling. See [integrity verification response](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#25-integrity-verification-response). |
| Document Issuer | Review office analytics | `/portal/analytics` | Pending final verification | Real analytics aggregation and date-range queries. See [backend target handoff](LEXCHAIN-BACKEND-TARGET-HANDOFF.md). |
| Document Issuer | Use System Management | `/portal/users`, `/portal/issuer-invitations`, `/portal/system-reports`, `/portal/audit-logs`, `/portal/system-statistics` | Pending final verification | Real server-issued issuer authority, management endpoints, validations, and audit logging. See [Document Issuer user management](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#26-document-issuer-user-management). |
| Document Participant | Sign in to the restricted shared workspace | `/login`, `/portal/dashboard` | Pending final verification | Real participant auth/session enforcement remains backend-owned. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Participant | View shared documents without issuer controls | `/portal/documents`, `/portal/documents/[id]` | Pending final verification | Real backend authorization on document scope and lifecycle actions. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Participant | Accept or reject document invitations | `/portal/invitations` | Pending final verification | Real invitation persistence and document-scope authorization. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Participant | Search, requests, and notifications | `/portal/search`, `/portal/requests/my`, `/portal/notifications` | Pending final verification | Production data sources and permissions remain backend-owned. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |

## Notes

- The registered actors are exactly Document Issuer and Document Participant.
  Anonymous verification at `/verify` is a public feature, not a registered
  actor. Mobile-native flows remain deferred and do not add a web actor.
- Legacy routes redirect for compatibility: `/admin/dashboard` to
  `/portal/dashboard`, `/admin/users` to `/portal/users`,
  `/admin/invitations-permissions` to `/portal/issuer-invitations`,
  `/admin/generated-reports` to `/portal/system-reports`, `/admin/audit-logs`
  to `/portal/audit-logs`, and `/admin/login` to `/login`. Other `/admin/*`
  page routes fall back to `/portal/dashboard`; `/api/admin/*` remains a
  backend-proxy namespace.
- The target keeps demo honesty: no screen may claim that
  password reset, finalization, restoration, reports, blockchain actions, or
  analytics are production-connected when they are still backed by mock data.
- The migration failures must be resolved before test, lint, build, and
  browser-acceptance results can be reported as current.
