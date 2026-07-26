# LexChain Web Target UI/UX Status

Date: 2026-07-26
Branch: `feat/two-actor-portal`
Implementation code HEAD reviewed: f279028cb77631f56bd6d4a0ac6164057e870f4b

## Verification snapshot

- `pnpm --filter @lexchain/web test` — passed (`56` files, `301` tests)
- `pnpm --filter @lexchain/web lint` — passed
- `pnpm --filter @lexchain/web build` — passed
- `git diff --check` — passed
- `git diff --name-only -- apps/mobile openapi-updated.json packages/types/src/generated/schema.ts` — no output
- Actor terminology scan — no documentation elevates Admin beyond a Document
  Issuer capability level or presents `/admin/dashboard` as an active workspace
- Active-navigation scan — three `/admin` references remain inside legacy
  template components; proxy redirects prevent those page components from
  serving as product navigation
- Playwright CLI acceptance — all Task 5 persona and redirect cases passed in
  mock mode; see `LEXCHAIN-TWO-ACTOR-PORTAL-ACCEPTANCE.md`
- Responsive Playwright acceptance — passed at `390x844`; the Super Admin
  issuer reached all five privileged destinations and the standard issuer saw
  none of those links

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

### Document Issuer — Super Admin capabilities

- A Document Issuer with Super Admin capabilities signs in through `/login` and
  enters the same `/portal/dashboard` workspace as every other issuer.
- The capability retains ordinary issuer workflows under their existing
  ownership and authorization rules; it adds management and system reporting
  without creating document ownership.
- The `Super Admin` navigation group exposes User Accounts, Issuer Invitations,
  System Reports, Audit Logs, and System Statistics under `/portal/*` routes.
- Privileged portal routes remain bound to the server-issued `admin_token`; the
  client-readable role cookie is not authorization.
- User edits, suspend/reactivate actions, and report generation remain honest
  mock-mode interactions and reset on refresh.

### Document Participant

- Document Participant sign-in still routes to the portal workspace.
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
| Document Issuer | Use Super Admin capabilities | `/portal/users`, `/portal/issuer-invitations`, `/portal/system-reports`, `/portal/audit-logs`, `/portal/system-statistics` | Ready for web UI review | Real server-issued Super Admin authority, management endpoints, validations, and audit logging. See [Super Admin user management](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#26-document-issuer--super-admin-user-management). |
| Document Participant | Sign in to the restricted shared workspace | `/login`, `/portal/dashboard` | Already implemented | Real participant auth/session enforcement remains backend-owned. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Participant | View shared documents without issuer controls | `/portal/documents`, `/portal/documents/[id]` | Ready for web UI review | Real backend authorization on document scope and lifecycle actions. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Participant | Accept or reject document invitations | `/portal/invitations` | Ready for web UI review | Real invitation persistence and document-scope authorization. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Participant | Search, requests, and notifications | `/portal/search`, `/portal/requests/my`, `/portal/notifications` | Already implemented | Production data sources and permissions remain backend-owned. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |

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
- The current branch intentionally keeps demo honesty: no screen claims that
  password reset, finalization, restoration, reports, blockchain actions, or
  analytics are production-connected when they are still backed by mock data.
- The only non-blocking verification noise is the existing Next.js
  worktree/multiple-lockfile root warning during `next build`.
