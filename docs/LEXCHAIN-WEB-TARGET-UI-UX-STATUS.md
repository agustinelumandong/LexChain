# LexChain Web Target UI/UX Status

Date: 2026-07-26  
Branch: `feat/web-target-ui-ux`  
Head: `81d508920db770a6e049021e3b0fa5301e65832b`

## Verification snapshot

- `pnpm --filter @lexchain/web test` — passed (`48` files, `253` tests)
- `pnpm --filter @lexchain/web lint` — passed
- `pnpm --filter @lexchain/web build` — passed
- `git diff --check` — passed
- `git diff --name-only 9c4e238 -- apps/mobile openapi-updated.json packages/types/src/generated/schema.ts` — no output
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
  shared demo document state.

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

## Status matrix

| Actor | Target use case | Web route | Web UI status | Production dependency |
| --- | --- | --- | --- | --- |
| Document Issuer | Sign in | `/login` | Already implemented | Real authentication and role authority must remain server-backed. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Document Issuer | Forgot password request | `/forgot-password` | Ready for web UI review | Real email delivery, token issuance, and password reset audit trail. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Document Issuer | Reset password | `/reset-password` | Ready for web UI review | Real token validation and password update endpoint. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Document Issuer | Review a completed draft and finalize it | `/portal/documents/[id]` | Ready for web UI review | Real finalize workflow, persistence, and final-state enforcement. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Document Issuer | Inspect document activity | `/portal/documents/[id]/activity` | Ready for web UI review | Real audit-log persistence and authorization. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Document Issuer | Restore from mismatch/snapshot history | `/portal/documents/[id]` | Ready for web UI review | Real snapshot restore endpoint, validation, and audit trail. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Document Issuer | Generate office reports | `/portal/reports` | Ready for web UI review | Real report queries, exports, and server-generated files. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Document Issuer | Review processing state | `/portal/processing` | Ready for web UI review | Real processing pipeline status and retry/error semantics. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Document Issuer | Review blockchain records | `/portal/blockchain-records` | Ready for web UI review | Real blockchain verification/record services and failure handling. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Document Issuer | Review office analytics | `/portal/analytics` | Ready for web UI review | Real analytics aggregation and date-range queries. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Admin | Sign in to admin workspace | `/login`, `/admin/dashboard` | Ready for web UI review | Real admin auth/session enforcement beyond mock/demo UI. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Admin | Edit, suspend, and reactivate users | `/admin/users` | Ready for web UI review | Real user-management endpoints, validations, and audit logging. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Admin | Generate fixed system reports | `/admin/generated-reports` | Ready for web UI review | Real report data, exports, and server-side generation. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Participant | Sign in to shared workspace | `/login`, `/portal/dashboard` | Already implemented | Real participant auth/session enforcement remains backend-owned. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Participant | View shared document without issuer controls | `/portal/documents/[id]` | Ready for web UI review | Real backend authorization on document scope and lifecycle actions. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Participant | Search, requests, and notifications | `/portal/search`, `/portal/requests`, `/portal/notifications` | Already implemented | Production data sources and permissions remain backend-owned. See `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`. |
| Mobile actor flows | Camera capture, mobile-native upload, mobile verification | `apps/mobile/*` | Deferred to mobile phase | Mobile implementation remains out of scope for this web-only branch. |

## Notes

- `/admin/roles-permissions` still exists as a legacy route, but the web target
  flow no longer exposes it from user management.
- The current branch intentionally keeps demo honesty: no screen claims that
  password reset, finalization, restoration, reports, blockchain actions, or
  analytics are production-connected when they are still backed by mock data.
- The only non-blocking verification noise is the existing Next.js
  worktree/multiple-lockfile root warning during `next build`.
