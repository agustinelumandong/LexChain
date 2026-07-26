# LexChain Two-Actor Portal Acceptance

Date: 2026-07-27

Verified implementation commit: `5a0d7e0d3cd1d4509acb995c94d66e80a6920214`

Mode: production Next.js build with the repository's mock API

Desktop viewport: `1440x1000`

Mobile viewport: `390x844`

## Verification setup

The production build and acceptance server were run from the repository root:

```bash
pnpm --filter @lexchain/web build
USE_MOCK_API=true pnpm --filter @lexchain/web start --hostname 127.0.0.1 --port 3216
```

The browser walk-through used the installed Playwright CLI wrapper. The server
was stopped after acceptance, and port `3216` had no remaining listener.

## Acceptance matrix

| Persona | Required result | Observed result | Status |
| --- | --- | --- | --- |
| Document Issuer | Exact role label; all five navigation groups; all five System Management pages reachable on desktop and mobile | `issuer@example.com` reached `/portal/dashboard` with exact `Document Issuer` profile copy. `Workspace`, `Integrity`, `Office`, `System Management`, and `Account` were present. Every management destination rendered at both viewports. | Pass |
| Document Participant | Exact role label; participant navigation only; direct issuer-management URLs safely denied | `participant@example.com` reached `/portal/dashboard` with exact `Document Participant` profile copy and only `Shared Documents`, `Invitations`, `My E-copy Requests`, and `Profile & Security`; the desktop top bar had no Processing Monitor link. Every direct management request returned to the dashboard without management content. | Pass |
| Legacy URL | `/admin/*` resolves to its `/portal/*` compatibility target without exposing a separate workspace | `/admin/users` resolved to `/portal/users` for the issuer and rendered the ordinary portal `Users` page. | Pass |

Both mock identities used `Password123`.

## Routes checked

### Document Issuer on desktop

The issuer signed in through `/login`, landed on `/portal/dashboard`, and then
opened each destination through the portal navigation:

| Route | Expected heading | Observed |
| --- | --- | --- |
| `/portal/users` | `Users` | Pass |
| `/portal/issuer-invitations` | `Issuer Invitations` | Pass |
| `/portal/system-reports` | `Generated Reports` | Pass |
| `/portal/audit-logs` | `Audit Logs` | Pass |
| `/portal/system-statistics` | `System Statistics` | Pass |

The visible content on these pages contained no conditional issuer-tier copy.
Opening `/admin/users` resolved to `/portal/users` and retained the `Users`
heading inside the same portal shell.

### Document Participant on desktop

The participant signed in through `/login` and landed on `/portal/dashboard`.
Direct navigation to all five issuer-management routes was checked:

- `/portal/users`
- `/portal/issuer-invitations`
- `/portal/system-reports`
- `/portal/audit-logs`
- `/portal/system-statistics`

Each request resolved safely to `/portal/dashboard`; none rendered its
management heading or controls. A non-HttpOnly client cookie named `user_role`
was then set to `document_issuer` while the participant session remained
active. A fresh request to `/portal/users` was still denied and returned to the
dashboard, confirming that the client-side role hint did not grant access.

The 2026-07-27 desktop recheck also confirmed that the participant top bar has
Search, Notifications, Help, and the participant profile only. It does not
render the issuer-only Processing Monitor link.

## Invitation mutation fix-round recheck

The production server was exercised directly and through the issuer browser
session. Anonymous invitation `POST` and `DELETE` requests returned `401`.
Presenting the participant credential as `issuer_token` returned `403` for both
mutations. The exact issuer credential returned `201` for `POST` and `200` for
`DELETE`.

In the browser, the signed-in issuer created `round1@example.com` from the
Issuer Invitations page and revoked the seeded `demo-0` invitation. The
observed network responses were `201 Created` and `200 OK`, respectively.

### Document Issuer at `390x844`

The issuer signed in again after resizing the browser. The named mobile portal
navigation exposed `User Accounts`, `Issuer Invitations`, `System Reports`,
`Audit Logs`, and `System Statistics`. Each link was clicked and reached the
same five portal routes and headings listed above. The measured document-level
horizontal overflow was `0px` on every destination, so active content was not
clipped by the viewport. The visible actor label remained `Document Issuer`,
and no separate management shell appeared.

## Approved use-case comparison

The final role boundary was compared with the approved design's 19 Document
Issuer and 7 Document Participant use cases. The canonical access matrix still
assigns all issuer document, integrity, office, notification, account, and five
System Management capabilities to `document_issuer`; it assigns only the seven
shared-document, notification, account, and search capabilities to
`document_participant`. There is no conditional issuer tier, no separate
workspace, and no authorization fallback for obsolete account roles.

The complete automated web suite passed `312` tests across `63` files. The
browser run specifically exercised authentication labels, role navigation,
all five management routes, participant denial, the client-cookie bypass
attempt, the compatibility redirect, and responsive issuer access. It did not
interactively execute every document-lifecycle operation in the 19/7 design
matrix.

## Local evidence

The 2026-07-27 fix-round snapshots are under
`output/playwright/task7/fix-round-1/.playwright-cli/`. This generated folder is
ignored and was not committed as product source.

## Limitations

This acceptance covers the web application with seeded mock data. It does not
claim production backend, database, OpenAPI, mobile-app, email-delivery,
blockchain, or persistence verification. The planned
`docs/LEXCHAIN-END-TO-END-TEST-FLOW.md` file is absent from this worktree and
repository history, so the source scan that names that file cannot be executed
verbatim; the seven existing target documentation files were scanned instead.
