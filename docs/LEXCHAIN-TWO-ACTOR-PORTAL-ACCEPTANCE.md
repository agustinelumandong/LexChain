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

The final-state rerun used a fresh server started from the repository root:

```bash
NEXT_PUBLIC_USE_MOCK_API=true USE_MOCK_API=true \
  pnpm --filter @lexchain/web exec next dev -H 127.0.0.1 -p 3216

PWCLI=/home/cshan28/.codex/skills/playwright/scripts/playwright_cli.sh
```

The login fields and button were `e12`, `e14`, and `e19` in each persona's
fresh login snapshot. These element refs are snapshot-derived and may change on
a rerun. `Password123` is the public mock credential defined in the repository.

### Super Admin issuer final checkpoints

```bash
"$PWCLI" -s=task5-final-admin open http://127.0.0.1:3216/login
"$PWCLI" -s=task5-final-admin snapshot
"$PWCLI" -s=task5-final-admin fill e12 admin@example.com
"$PWCLI" -s=task5-final-admin fill e14 Password123
"$PWCLI" -s=task5-final-admin click e19
"$PWCLI" -s=task5-final-admin goto http://127.0.0.1:3216/admin/dashboard
"$PWCLI" -s=task5-final-admin run-code \
  "async (page) => { await page.getByRole('region', { name: 'Super Admin' }).waitFor(); }"
"$PWCLI" -s=task5-final-admin snapshot --filename \
  .playwright-cli/task5-final-admin-dashboard.md
"$PWCLI" -s=task5-final-admin goto http://127.0.0.1:3216/admin/users
"$PWCLI" -s=task5-final-admin run-code \
  "async (page) => { await page.getByRole('heading', { name: 'Users', exact: true }).waitFor(); }"
"$PWCLI" -s=task5-final-admin snapshot --filename \
  .playwright-cli/task5-final-admin-users.md
```

Verified final-state artifacts:

- `.playwright-cli/task5-final-admin-dashboard.md` contains the
  `Document Issuer Portal` heading, the `Super Admin` region, and all five tool
  labels.
- `.playwright-cli/task5-final-admin-users.md` contains the final `Users`
  heading and the Super Admin navigation.

### Standard issuer denied-route checkpoint

```bash
"$PWCLI" -s=task5-final-lawyer open http://127.0.0.1:3216/login
"$PWCLI" -s=task5-final-lawyer snapshot
"$PWCLI" -s=task5-final-lawyer fill e12 lawyer@example.com
"$PWCLI" -s=task5-final-lawyer fill e14 Password123
"$PWCLI" -s=task5-final-lawyer click e19
"$PWCLI" -s=task5-final-lawyer run-code \
  "async (page) => { await page.getByRole('heading', { name: 'Document Issuer Portal' }).waitFor(); }"
"$PWCLI" -s=task5-final-lawyer goto http://127.0.0.1:3216/portal/users
"$PWCLI" -s=task5-final-lawyer run-code \
  "async (page) => { await page.getByRole('heading', { name: 'Document Issuer Portal' }).waitFor(); if (await page.getByRole('region', { name: 'Super Admin' }).count()) throw new Error('Unexpected Super Admin region'); }"
"$PWCLI" -s=task5-final-lawyer snapshot --filename \
  .playwright-cli/task5-final-lawyer-denied.md
```

`.playwright-cli/task5-final-lawyer-denied.md` contains the final
`Document Issuer Portal` heading and `Document Issuer · Super User` copy. A
direct content scan confirmed it contains neither `Super Admin` nor a `Users`
heading.

### Document Participant denied-route checkpoint

```bash
"$PWCLI" -s=task5-final-participant open http://127.0.0.1:3216/login
"$PWCLI" -s=task5-final-participant snapshot
"$PWCLI" -s=task5-final-participant fill e12 user@example.com
"$PWCLI" -s=task5-final-participant fill e14 Password123
"$PWCLI" -s=task5-final-participant click e19
"$PWCLI" -s=task5-final-participant run-code \
  "async (page) => { await page.getByText('The Document Issuer Portal dashboard is available to Document Issuers only.', { exact: true }).waitFor(); }"
"$PWCLI" -s=task5-final-participant goto http://127.0.0.1:3216/portal/users
"$PWCLI" -s=task5-final-participant run-code \
  "async (page) => { await page.getByText('The Document Issuer Portal dashboard is available to Document Issuers only.', { exact: true }).waitFor(); if (await page.getByRole('heading', { name: 'Users', exact: true }).count()) throw new Error('Unexpected Users page'); if (await page.getByRole('region', { name: 'Super Admin' }).count()) throw new Error('Unexpected Super Admin region'); }"
"$PWCLI" -s=task5-final-participant snapshot --filename \
  .playwright-cli/task5-final-participant-denied.md
```

`.playwright-cli/task5-final-participant-denied.md` contains `Document
Participant`, the restricted participant links, and the issuer-only dashboard
denial copy. A direct content scan confirmed it contains neither `Super Admin`
nor a `Users` heading.

The sessions were closed with `"$PWCLI" -s=<session-name> close`. The dev
server was stopped with `Ctrl-C`, and port `3216` had no listener afterward.

## Responsive mobile navigation evidence

A separate responsive pass used the local mock server at `127.0.0.1:3227` and
Playwright CLI `resize 390 844`. The Super Admin issuer navigated successfully
to all five privileged destinations:

- `/portal/users`
- `/portal/issuer-invitations`
- `/portal/system-reports`
- `/portal/audit-logs`
- `/portal/system-statistics`

The standard issuer retained ordinary mobile portal navigation and exposed
none of those five privileged links.

Stable post-wait evidence:

- `.playwright-cli/final-mobile-admin-dashboard.md`
- `.playwright-cli/final-mobile-admin-users.md`
- `.playwright-cli/final-mobile-admin-invitations.md`
- `.playwright-cli/final-mobile-admin-reports.md`
- `.playwright-cli/final-mobile-admin-audit.md`
- `.playwright-cli/final-mobile-admin-statistics.md`
- `.playwright-cli/final-mobile-lawyer-dashboard.md`

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
