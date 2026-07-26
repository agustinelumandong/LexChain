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

## Playwright CLI transcript

The server was started from the repository root with:

```bash
NEXT_PUBLIC_USE_MOCK_API=true USE_MOCK_API=true \
  pnpm --filter @lexchain/web exec next dev -H 127.0.0.1 -p 3215

PWCLI=/home/cshan28/.codex/skills/playwright/scripts/playwright_cli.sh
```

The login fields and button were `e12`, `e14`, and `e19` in each persona's
fresh login snapshot. These element refs are snapshot-derived and may change on
a rerun. `Password123` is the public mock credential defined in the repository.

### Super Admin issuer session

```bash
"$PWCLI" -s=task5-admin open http://127.0.0.1:3215/login
"$PWCLI" -s=task5-admin snapshot
"$PWCLI" -s=task5-admin fill e12 admin@example.com
"$PWCLI" -s=task5-admin fill e14 Password123
"$PWCLI" -s=task5-admin click e19
"$PWCLI" -s=task5-admin snapshot
"$PWCLI" -s=task5-admin goto http://127.0.0.1:3215/admin/dashboard
"$PWCLI" -s=task5-admin snapshot
"$PWCLI" -s=task5-admin goto http://127.0.0.1:3215/admin/users
"$PWCLI" -s=task5-admin snapshot
```

Observed snapshot artifacts, in command order:

- `.playwright-cli/page-2026-07-26T10-09-46-543Z.yml` — login refs
- `.playwright-cli/page-2026-07-26T10-09-56-378Z.yml` — `/portal/dashboard`
- `.playwright-cli/page-2026-07-26T10-10-05-045Z.yml` — redirected legacy dashboard
- `.playwright-cli/page-2026-07-26T10-10-07-247Z.yml` — redirected legacy user management

### Standard issuer session

```bash
"$PWCLI" -s=task5-lawyer open http://127.0.0.1:3215/login
"$PWCLI" -s=task5-lawyer snapshot
"$PWCLI" -s=task5-lawyer fill e12 lawyer@example.com
"$PWCLI" -s=task5-lawyer fill e14 Password123
"$PWCLI" -s=task5-lawyer click e19
"$PWCLI" -s=task5-lawyer snapshot
"$PWCLI" -s=task5-lawyer goto http://127.0.0.1:3215/portal/users
"$PWCLI" -s=task5-lawyer snapshot
```

Observed snapshot artifacts, in command order:

- `.playwright-cli/page-2026-07-26T10-10-15-788Z.yml` — login refs
- `.playwright-cli/page-2026-07-26T10-10-18-864Z.yml` — `/portal/dashboard`
- `.playwright-cli/page-2026-07-26T10-10-28-451Z.yml` — denied route redirected to `/portal/dashboard`

### Document Participant session

```bash
"$PWCLI" -s=task5-participant open http://127.0.0.1:3215/login
"$PWCLI" -s=task5-participant snapshot
"$PWCLI" -s=task5-participant fill e12 user@example.com
"$PWCLI" -s=task5-participant fill e14 Password123
"$PWCLI" -s=task5-participant click e19
"$PWCLI" -s=task5-participant snapshot
"$PWCLI" -s=task5-participant goto http://127.0.0.1:3215/portal/users
"$PWCLI" -s=task5-participant snapshot
```

Observed snapshot artifacts, in command order:

- `.playwright-cli/page-2026-07-26T10-10-36-504Z.yml` — login refs
- `.playwright-cli/page-2026-07-26T10-10-40-385Z.yml` — `/portal/dashboard`
- `.playwright-cli/page-2026-07-26T10-10-51-326Z.yml` — denied route redirected to `/portal/dashboard`

The sessions were closed with `"$PWCLI" -s=<session-name> close`. The dev
server was stopped with `Ctrl-C`, and port `3215` had no listener afterward.

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
