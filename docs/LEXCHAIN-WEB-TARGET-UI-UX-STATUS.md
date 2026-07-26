# LexChain Web Target UI/UX Status

Date: 2026-07-27 (Asia/Manila)

Branch: `fix/single-document-issuer`

Verified implementation commit:
`5c2e59bd7f017a96af0c2421c05b462737242a42`

## Verification state

The bounded web correction is verified against the canonical two-actor model:
`document_issuer` and `document_participant`. The production Next.js build was
run with the repository's mock API; this verifies the web UI, route boundaries,
and local demo behavior, not the production integrations listed below.

- Full web suite: pass, 64 files and 343 tests.
- ESLint: pass.
- Production build: pass, including TypeScript and 68 generated routes.
- `git diff --check`: pass.
- Desktop acceptance at `1440x1000`: pass for both actors.
- Mobile acceptance at `390x844`: pass for both actors with 0px horizontal
  overflow on every route measured.
- Invitation transport checks: anonymous `401`, participant `403`, invalid
  input `400`, and canonical issuer input `201`.
- Final targeted re-review: no Critical, Important, or Minor findings.

Mock acceptance used `issuer@example.com` and `participant@example.com`, both
with `Password123`.

## Verified actor behavior

### Document Issuer

- Signs in through `/login` and lands on `/portal/dashboard`.
- Receives the exact `Document Issuer` label and all five navigation groups:
  Workspace, Integrity, Office, System Management, and Account.
- Can reach User Accounts, Issuer Invitations, System Reports, Audit Logs, and
  System Statistics through `/portal/*` on desktop and mobile.
- Receives an `issuer_token` only after exact issuer authority is established.
- Invitation creation accepts only a valid email and fixes the server payload
  role to `document_issuer`.

### Document Participant

- Signs in through `/login` and lands on the usable shared-document workspace
  at `/portal/documents`.
- Receives the exact `Document Participant` identity and only Shared
  Documents, Invitations, My E-copy Requests, and Profile & Security in portal
  navigation.
- Can reach documents, invitations, requests, notifications, and profile on
  mobile without an issuer dashboard dead end.
- Is denied all five issuer-management routes server-side. Duplicating the
  participant token into `issuer_token` or supplying an arbitrary forged
  issuer cookie does not render management content.
- Does not receive Processing Monitor or other issuer-only navigation.

## Status matrix

| Actor | Target use case | Web route | Web UI status | Production dependency |
| --- | --- | --- | --- | --- |
| Document Issuer | Sign in | `/login` | Browser and automated mock-web pass | Real authentication and role authority remain backend-owned. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Both actors | Forgot and reset password | `/forgot-password`, `/reset-password` | Automated mock-web pass | Real email delivery, tokens, password update, and audit trail. See [password recovery](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#22-password-recovery). |
| Document Issuer | Review and finalize a draft | `/portal/documents/[id]` | Automated mock-web pass | Real finalize workflow, persistence, and final-state enforcement. See [atomic document finalization](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#23-atomic-document-finalization). |
| Document Issuer | Inspect document activity | `/portal/documents/[id]/activity` | Automated mock-web pass | Real audit persistence and authorization. See [authorization and audit](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#28-authorization-and-audit-requirements). |
| Document Issuer | Restore from mismatch or snapshot history | `/portal/documents/[id]` | Automated mock-web pass | Real snapshot restore, validation, and audit. See [snapshot listing and restoration](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#24-snapshot-listing-and-restoration). |
| Document Issuer | Generate office reports | `/portal/reports` | Automated mock-web pass | Real report queries, exports, and generated files. See [fixed reports](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#27-fixed-reports). |
| Document Issuer | Review processing, blockchain, and analytics | `/portal/processing`, `/portal/blockchain-records`, `/portal/analytics` | Automated mock-web pass | Real processing, blockchain, verification, and analytics services. See [backend target handoff](LEXCHAIN-BACKEND-TARGET-HANDOFF.md). |
| Document Issuer | Use System Management | Five management routes under `/portal/*` | Desktop/mobile browser and automated pass | Real management endpoints, persistence, validation, and audit. See [Document Issuer user management](LEXCHAIN-BACKEND-TARGET-HANDOFF.md#26-document-issuer-user-management). |
| Document Participant | Sign in to the restricted workspace | `/login`, `/portal/documents` | Desktop/mobile browser and automated pass | Real participant session and document-scope authority remain backend-owned. |
| Document Participant | View shared documents | `/portal/documents`, `/portal/documents/[id]` | Mobile browser and automated pass | Real document data and lifecycle authorization. |
| Document Participant | Accept or reject invitations | `/portal/invitations` | Mobile browser and automated pass | Real invitation persistence and document-scope authorization. |
| Document Participant | Requests, notifications, and profile | `/portal/requests/my`, `/portal/notifications`, `/portal/profile` | Mobile browser and automated pass | Production data sources and permissions remain backend-owned. |

## Boundaries and limitations

- Anonymous verification at `/verify` remains a public feature, not a third
  registered actor.
- `/admin/*` page URLs remain compatibility redirects into `/portal/*`;
  `/api/admin/*` remains an internal route-handler namespace, not a visible
  Admin workspace.
- Unsupported and obsolete account roles do not receive compatibility
  authorization.
- Browser evidence used seeded mock web data. It does not prove the backend,
  database, OpenAPI, mobile app, email delivery, blockchain, or persistence.
- The planned `docs/LEXCHAIN-END-TO-END-TEST-FLOW.md` file is absent, so the
  source scan naming it cannot be run verbatim. All existing target documents
  in that scan were checked.
