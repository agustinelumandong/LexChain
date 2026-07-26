# LexChain Two-Actor Portal Acceptance

Date: 2026-07-27 (Asia/Manila)

Verified implementation commit:
`5c2e59bd7f017a96af0c2421c05b462737242a42`

Mode: production Next.js build with the repository's mock API

Desktop viewport: `1440x1000`

Mobile viewport: `390x844`

## Verification setup

The final automated checks and production acceptance server were run from the
repository:

```bash
pnpm --filter @lexchain/web test
pnpm --filter @lexchain/web lint
pnpm --filter @lexchain/web build
USE_MOCK_API=true pnpm --filter @lexchain/web start --hostname 127.0.0.1 --port 3216
```

The installed Playwright CLI wrapper drove fresh named browser sessions. All
sessions were closed, the server was stopped, and port `3216` had no remaining
listener.

## Acceptance matrix

| Persona | Required result | Observed result | Status |
| --- | --- | --- | --- |
| Document Issuer | Exact role label; all five navigation groups; all five System Management pages reachable on desktop and mobile | `issuer@example.com` landed on `/portal/dashboard` with exact `Document Issuer` identity. Workspace, Integrity, Office, System Management, and Account were present. Every management page rendered at both viewports. | Pass |
| Document Participant | Exact role identity; participant navigation only; usable mobile workspace; issuer routes denied | `participant@example.com` landed on `/portal/documents`. Desktop and mobile exposed only participant destinations. Documents, invitations, requests, notifications, and profile were reachable; every management URL was denied. | Pass |
| Legacy URL | `/admin/*` resolves to its `/portal/*` target without exposing a separate workspace | `/admin/users` resolved to `/portal/users` for the issuer inside the ordinary portal shell. | Pass |

Both mock identities used `Password123`.

## Document Issuer verification

### Desktop

The issuer signed in through `/login` and opened every System Management
destination:

| Route | Expected heading | Observed |
| --- | --- | --- |
| `/portal/users` | `Users` | Pass |
| `/portal/issuer-invitations` | `Issuer Invitations` | Pass |
| `/portal/system-reports` | `Generated Reports` | Pass |
| `/portal/audit-logs` | `Audit Logs` | Pass |
| `/portal/system-statistics` | `System Statistics` | Pass |

Each page had 0px document-level horizontal overflow. The shell retained the
exact Document Issuer identity without a conditional issuer tier.
`/admin/users` resolved to `/portal/users` with the same heading and shell.

### Mobile

At `390x844`, the named mobile navigation exposed visible labels for all five
management destinations: User Accounts, Issuer Invitations, System Reports,
Audit Logs, and System Statistics. Each route and heading above was observed,
and every measured page had 0px horizontal overflow.

## Document Participant verification

### Desktop

The participant signed in through `/login` and landed on the usable shared
document route `/portal/documents`, not the issuer-only dashboard. The shell
used the exact Document Participant identity, linked the LexChain logo to
`/portal/documents`, omitted Processing Monitor, and exposed only participant
destinations.

Direct navigation to each issuer-management route was then attempted:

- `/portal/users`
- `/portal/issuer-invitations`
- `/portal/system-reports`
- `/portal/audit-logs`
- `/portal/system-statistics`

Every request resolved safely to `/portal/dashboard` without rendering the
requested management heading or controls. The participant's navigation
remained available from that denial state.

Two authority-bypass attempts were also checked against `/portal/users`:

1. the participant token duplicated into both `portal_token` and
   `issuer_token`;
2. the valid participant `portal_token` paired with an arbitrary
   `issuer_token=forged-issuer-token`.

Both attempts returned to `/portal/dashboard`, rendered no Users content, and
exposed no Processing Monitor link.

### Mobile

At `390x844`, the participant walked through:

| Route | Observed heading | Horizontal overflow |
| --- | --- | --- |
| `/portal/documents` | `Documents` | 0px |
| `/portal/invitations` | `Invitations` | 0px |
| `/portal/requests/my` | `My E-copy Requests` | 0px |
| `/portal/notifications` | `Notifications` | 0px |
| `/portal/profile` | `Profile`, `Document Participant` | 0px |

The mobile navigation kept visible labels for Shared Documents, Invitations,
My E-copy Requests, and Profile & Security. It contained no issuer-management
link and no Processing Monitor link. Notifications remained reachable through
the portal top bar.

## Invitation boundary verification

Direct `POST /api/admin/invitations` checks against the production server
observed:

| Case | Result |
| --- | --- |
| No session | `401 Not authenticated` |
| Participant credential presented as issuer authority | `403 Document Issuer access required` |
| Authenticated issuer with invalid JSON | `400` |
| Authenticated issuer with invalid email | `400` |
| Authenticated issuer with legacy `admin` role | `400` |
| Authenticated issuer with valid email and exact `document_issuer` role | `201` |

The route tests additionally prove missing, blank, and non-string emails fail;
legacy, participant, and arbitrary roles fail; and the real upstream payload
contains only the trimmed email plus `role: "document_issuer"`.

## Automated and review evidence

- Full suite: 64 test files and 343 tests passed.
- ESLint: passed.
- Production build: compiled, type-checked, and generated 68 routes.
- `git diff --check`: passed.
- Browser console: zero errors and zero warnings in all four full-matrix
  sessions.
- React Doctor: one high-confidence warning in the changed layout was fixed
  under RED/GREEN; the scan moved from 82 to 81 broad branch warnings.
- Targeted final re-review: no Critical, Important, or Minor findings.

The final build smoke at the implementation commit reconfirmed issuer access to
`/portal/users`, participant denial, the four participant mobile labels, 0px
overflow, and the explicit non-submit sidebar control.

## Local evidence

The full final-fix browser snapshots are under
`output/playwright/final-fix/.playwright-cli/`. This generated output is
ignored and was not committed as product source.

## Limitations

This acceptance covers the web application with seeded mock data. It does not
claim production backend, database, OpenAPI, mobile-app, email-delivery,
blockchain, or persistence verification. It also does not interactively
execute every document-lifecycle operation in the approved 19/7 use-case
matrix; those broader UI boundaries are supported by source review and the
complete automated suite.

The planned `docs/LEXCHAIN-END-TO-END-TEST-FLOW.md` file is absent from this
worktree and repository history, so the source scan naming that file cannot be
run verbatim. The existing target documentation files were scanned instead.
