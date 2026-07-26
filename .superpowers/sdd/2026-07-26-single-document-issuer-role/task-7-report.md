# Task 7 Final Web Verification Report

## Status

Complete. The final web suite, lint, production build, source review, desktop
two-actor acceptance, responsive issuer acceptance, compatibility redirect,
and server cleanup all passed.

## Scope completed

- Migrated the final active web test fixtures from obsolete account roles to
  `document_issuer` and `document_participant`.
- Migrated seeded user-management roles to the two canonical role values.
- Fixed all four server-rendered System Management pages to read the
  server-only `USE_MOCK_API` flag used by the required production start command.
- Added a regression test proving those pages do not call the backend when
  server mock mode is enabled and the client-exposed flag is disabled.
- Fixed the mock toast provider to clear pending provider-owned timeouts on
  unmount, with a focused regression test.
- Replaced the old browser transcript with the observed canonical two-actor
  acceptance evidence.
- Preserved Tasks 1-6, the backend/mobile boundaries, dependencies, and the
  internal `/api/admin/*` transport namespace.

## TDD and diagnosis record

The initial full suite failed in 9 files with 23 failing tests because those
tests still seeded the removed `admin`, `lawyer`, and `user` account roles. The
canonical production guards correctly denied those fixtures. After the fixture
migration, a focused source audit found legacy role data in the user-management
seed; the office-insight expectation was changed first, observed red, and then
the seed was migrated to make it green.

The first production browser request exposed a separate runtime defect: four
server-rendered management pages used `NEXT_PUBLIC_USE_MOCK_API`, so the exact
required `USE_MOCK_API=true` production command attempted relative backend
requests. A new test first failed with `Mock-mode pages must not call the
backend.` Each page was then changed to the server flag and the focused test
passed.

The first concurrent full-suite rerun also exposed an unhandled delayed toast
callback after JSDOM teardown. A fake-timer test demonstrated the timeout still
existed after provider cleanup. The provider now tracks its own timeout IDs,
removes fired IDs, and clears remaining IDs on unmount. The focused test and
subsequent full suite passed without an unhandled error.

## Automated verification

Fresh final commands from the repository root:

| Command | Result |
| --- | --- |
| `pnpm --filter @lexchain/web test` | Pass: 57 files, 299 tests |
| `pnpm --filter @lexchain/web lint` | Pass: ESLint exit 0 |
| `pnpm --filter @lexchain/web build` | Pass: compiled, TypeScript complete, 68 pages generated |
| `git diff --check` | Pass |

The production build emitted only the existing multiple-worktree-lockfile root
inference warning. It did not affect compilation, type checking, or static page
generation.

## Source and design review

- The active application scan found no tier helper or tier display copy.
- The seven existing target documentation files contained none of the stale
  target-model phrases in the Task 7 scan.
- The legacy-role fixture scan returned only two `role: 'user'` matches in the
  document question page. Both are chat-message author discriminants in the
  `'user' | 'ai'` message union, not account, session, or authorization roles;
  changing them would alter an unrelated domain meaning.
- The final behavior was compared with the approved 19 Document Issuer and 7
  Document Participant use cases. The canonical capability matrix remains
  19/7, all five System Management capabilities belong to every issuer, and
  participants receive only their restricted shared-document capability set.
- `proxy.ts` retains the complete legacy page redirect map. `/admin/users` was
  verified in the browser; the full redirect table and `/api/admin/*` bypass
  are covered by the passing `admin-access` tests. `/api/admin/*` remains an
  internal proxy namespace, not a separate workspace or authorization model.
- No compatibility authorization for obsolete account-role values was added.

## Browser verification

The verified production build ran with:

```bash
USE_MOCK_API=true pnpm --filter @lexchain/web start --hostname 127.0.0.1 --port 3216
```

### Desktop `1440x1000`

- `issuer@example.com` / `Password123` landed on `/portal/dashboard` with the
  exact `Document Issuer` profile label and all five groups: Workspace,
  Integrity, Office, System Management, and Account.
- The issuer opened `/portal/users`, `/portal/issuer-invitations`,
  `/portal/system-reports`, `/portal/audit-logs`, and
  `/portal/system-statistics`. The expected headings were `Users`, `Issuer
  Invitations`, `Generated Reports`, `Audit Logs`, and `System Statistics`.
- `/admin/users` resolved to `/portal/users` inside the ordinary portal shell.
- `participant@example.com` / `Password123` landed on `/portal/dashboard` with
  the exact `Document Participant` label and only Shared Documents,
  Invitations, My E-copy Requests, and Profile & Security.
- Direct participant requests to all five management URLs returned to
  `/portal/dashboard` without management content.
- Setting a client-side `user_role=document_issuer` cookie did not bypass the
  server-side denial.

### Mobile `390x844`

- The issuer's named mobile navigation displayed all five System Management
  destinations.
- Each link was clicked and reached the expected route and heading.
- Document-level horizontal overflow measured `0px` on all five destinations.
- Visible role copy remained `Document Issuer`; no separate management shell or
  conditional issuer tier appeared.

Both named Playwright sessions were closed. The production process was stopped
with `SIGINT`, and `ss -ltnp '( sport = :3216 )'` confirmed no remaining
listener. Local snapshots/screenshots are under
`output/playwright/task7/final/`; the output tree is ignored and was not
committed.

## Commits

- Implementation and test migration:
  `05bac78ff25d26d79e5f4f0cf512632071fe5fc1`
- Acceptance evidence:
  `a492bf2ba675ca5ef07e6a286798f4acc1152af7`

## Concerns and honest limitations

- `docs/LEXCHAIN-END-TO-END-TEST-FLOW.md` does not exist in this worktree or
  repository history. The exact multi-file documentation scan therefore cannot
  run verbatim; the seven existing target documents were scanned and passed.
- Browser acceptance used seeded web mock data. It does not prove production
  backend, database, email, blockchain, persistence, OpenAPI, or mobile-app
  integration.
- The browser run covered actor labels, navigation, management access, denial,
  compatibility, cookie-bypass resistance, and mobile responsiveness. It did
  not interactively execute every document-lifecycle operation in the approved
  19/7 use-case list; that broader boundary is backed by source review and the
  complete automated web suite.

## Fix round 1: review-gate repairs

### RED to GREEN evidence

- The original review identified anonymous mock invitation `POST`/`DELETE`
  success, participant access, and the server-only mock flag failure. The new
  route regressions cover anonymous `401`, participant `403`, and exact issuer
  `201`/`200` results with `USE_MOCK_API=true` and
  `NEXT_PUBLIC_USE_MOCK_API=false`; these would fail against the reviewed
  unguarded mock branches.
- The new top-bar regression requires Processing Monitor to be absent for a
  participant and present for an issuer. The previous unconditional link would
  fail the participant assertion.
- The management-view, register, invite, profile, and canonical-role
  regressions require the two visible product labels and fail closed to
  `Unsupported role` for obsolete or unknown account values.

### GREEN verification

| Command | Result |
| --- | --- |
| `pnpm --filter @lexchain/web exec vitest run` with the 9 repair test files | Pass: 9 files, 35 tests |
| `pnpm --filter @lexchain/web test` | Pass: 63 files, 312 tests |
| `pnpm --filter @lexchain/web lint` | Pass: ESLint exit 0 |
| `pnpm --filter @lexchain/web build` | Pass: compilation and TypeScript completed |
| `git diff --check` | Pass |

The configured application and target-document scans returned no target-model
matches. The legacy fixture scan returned only deliberate obsolete-role
rejection cases plus the unrelated `'user' | 'ai'` chat-message discriminator.
The build emitted the existing multiple-worktree-lockfile root-inference
warning only.

### Production browser and transport verification

The fresh production server used:

```bash
USE_MOCK_API=true pnpm --filter @lexchain/web start --hostname 127.0.0.1 --port 3216
```

- Direct transport checks: anonymous `POST`/`DELETE` returned `401`;
  participant credentials returned `403`; exact issuer credentials returned
  `201`/`200`.
- In the issuer Playwright session, `issuer@example.com` / `Password123`
  created an invitation and revoked a seeded invitation. The observed network
  responses were `201 Created` and `200 OK`.
- In the participant Playwright session,
  `participant@example.com` / `Password123` had no `issuer_token`, reached the
  Document Participant dashboard, showed no Processing Monitor top-bar link,
  and direct `/portal/issuer-invitations` navigation returned to
  `/portal/dashboard`.
- Both named browser sessions and the inherited default browser session were
  closed. The server stopped with `SIGINT`; port `3216` had no listener.

### Fix-round commit

- Implementation and tests:
  `5a0d7e0d3cd1d4509acb995c94d66e80a6920214`
