# LexChain Two-Actor Portal Acceptance

Date: 2026-07-26
Mode: real local Next.js dev server with `NEXT_PUBLIC_USE_MOCK_API=true` and
`USE_MOCK_API=true`; Playwright CLI wrapper

## Actor contract

LexChain has exactly two registered actors:

| Registered actor | Portal access |
| --- | --- |
| Document Issuer | `/portal/*`; Super Admin capabilities appear only for an issuer with server-authorized privileges. |
| Document Participant | Restricted `/portal/*` workspace for shared documents, invitations, requests, and profile access. |

Anonymous verification at `/verify` is a public feature, not a registered actor.

## Observed browser acceptance

| Case | Observed route and copy | Result |
| --- | --- | --- |
| Super Admin issuer sign-in (`admin@example.com`) | Landed on `/portal/dashboard`; profile copy was `Document Issuer · Super Admin`; one `Super Admin` navigation group showed `User Accounts`, `Issuer Invitations`, `System Reports`, `Audit Logs`, and `System Statistics`. | Pass |
| Standard issuer sign-in (`lawyer@example.com`) | Landed on `/portal/dashboard`; profile copy was `Document Issuer · Super User`; issuer Workspace, Integrity, Office, and Account groups were present; no `Super Admin` group or privileged tool links appeared in role navigation. | Pass |
| Participant sign-in (`user@example.com`) | Landed on `/portal/dashboard`; profile copy was `Document Participant`; role navigation contained `Shared Documents`, `Invitations`, `My E-copy Requests`, and `Profile & Security`, with no issuer or Super Admin navigation group. Dashboard copy stated `The Document Issuer Portal dashboard is available to Document Issuers only.` | Pass |
| Legacy dashboard | A Super Admin request to `/admin/dashboard` resolved to `/portal/dashboard`. | Pass |
| Legacy user management | A Super Admin request to `/admin/users` resolved to `/portal/users`; the page heading was `Users`. | Pass |
| Standard issuer direct privileged route | A request to `/portal/users` resolved safely to `/portal/dashboard`; no privileged page rendered. | Pass |
| Participant direct privileged route | A request to `/portal/users` resolved safely to `/portal/dashboard`; the restricted participant navigation remained visible and no privileged page rendered. | Pass |

Each interactive login was preceded by a fresh snapshot, and each navigation or
redirect was followed by a fresh snapshot. Browser acceptance found no blocking
route or access-control defect in the Task 5 cases.

## Route compatibility

| Legacy page route | Current destination |
| --- | --- |
| `/admin/dashboard` | `/portal/dashboard` |
| `/admin/users` | `/portal/users` |
| `/admin/invitations-permissions` | `/portal/issuer-invitations` |
| `/admin/generated-reports` | `/portal/system-reports` |
| `/admin/audit-logs` | `/portal/audit-logs` |
| `/admin/login` | `/login` |
| Other `/admin/*` pages | `/portal/dashboard` |

The `/api/admin/*` namespace remains available for backend proxy operations; it
is not a separate registered-actor workspace.

## Production boundary

This acceptance covers the mock-mode web experience only. It does not claim
that the backend, database, OpenAPI contract, generated types, or mobile app was
changed. Required production backend work and optional later improvements remain
separated in `LEXCHAIN-BACKEND-TARGET-HANDOFF.md`.
