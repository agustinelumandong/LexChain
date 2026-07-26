# Final Fix Report — Single Document Issuer Role

Date: 2026-07-27 (Asia/Manila)

Branch: `fix/single-document-issuer`

Reviewed baseline:
`3350f418b5f9d35c57958dc0d491f831a07b9604`

Verified implementation:
`5c2e59bd7f017a96af0c2421c05b462737242a42`

## Status

Complete. All four Important and five Minor findings from the final senior
review are resolved within the approved web/docs boundary. The full web suite,
lint, production build, source scans, desktop/mobile browser acceptance,
invitation transport checks, cleanup, and targeted re-review are green.

The targeted re-review of the final implementation diff reported no Critical,
Important, or Minor findings.

## Finding-by-finding resolution

### I1 — issuer management pages trusted cookie presence

Resolved with
`apps/web/app/portal/lib/issuer-page-access.ts`, reused by:

- `/portal/users`
- `/portal/issuer-invitations`
- `/portal/system-reports`
- `/portal/audit-logs`
- `/portal/system-statistics`

The guard requires both server cookies to represent the same session. In mock
mode it additionally requires the exact mock Document Issuer credential. In
real mode it calls the profile endpoint without caching and requires exact
`profile.role === "document_issuer"`. Missing, mismatched, malformed,
participant, obsolete, unknown, or unavailable authority fails closed before
local management content is produced.

Regression coverage exercises all five pages with:

- the exact mock issuer session;
- the participant token duplicated into both cookie names;
- a valid participant portal token plus arbitrary issuer cookie;
- real participant, obsolete, unknown, missing, and malformed profile roles;
- the exact real `document_issuer` profile.

### I2 — participant mobile dead end

Resolved by routing a participant login to `/portal/documents`, rendering the
role-generic bottom navigation for either canonical actor, keeping every mobile
destination visibly labeled, and reusing the actor landing rule for the
desktop LexChain logo.

Participant mobile now exposes only:

- Shared Documents
- Invitations
- My E-copy Requests
- Profile & Security

Notifications remain available from the top bar. Processing Monitor and all
issuer management destinations remain absent.

### I3 — invitation route accepted caller-controlled roles

Resolved at `POST /api/admin/invitations`:

1. authenticate before body parsing;
2. require the exact mock issuer credential in mock mode;
3. parse JSON safely;
4. validate and trim the email;
5. allow only an omitted role or exact `document_issuer`;
6. construct a new payload containing only the email and fixed canonical role;
7. perform the mock response or real upstream request only after validation.

Invalid JSON, missing/blank/non-string/invalid email, legacy account roles,
`document_participant`, and arbitrary roles now return `400`. The real-mode
test proves unknown caller fields are dropped and the upstream body is exactly
`{ email, role: "document_issuer" }`.

### I4 — status evidence contradicted verification

`docs/LEXCHAIN-WEB-TARGET-UI-UX-STATUS.md` and
`docs/LEXCHAIN-TWO-ACTOR-PORTAL-ACCEPTANCE.md` now identify the current branch
and implementation commit, report the final automated/browser evidence, use
`/portal/documents` as the participant landing route, and explicitly retain
the backend/mobile/integration limitations.

### M1 — malformed issuer cookie could throw

`getTokenFromRequest()` now treats percent-decoding failures as missing
authority. `issuer_token=%` returns a controlled `401` and does not call the
backend. Real-auth tests also preserve fail-closed behavior for obsolete,
participant, unknown, missing, and malformed profile roles.

### M2 — visible copy described an Admin product tier

Product-facing users, Terms, Privacy, and Download copy now uses Document
Issuer, System Management, or neutral management language. Internal
`/api/admin/*` and established implementation identifiers remain unchanged.

### M3 — dead invitation action defaulted to `lawyer`

The unreferenced `createInvitation` server action was deleted. The active
client-to-route-handler path is the only invitation creation path retained.

### M4 — inactive mobile items were icon-only

Every mobile destination now retains a compact visible label in active and
inactive states. Tests cover issuer and participant labels, and the browser
matrix measured 0px horizontal document overflow.

### M5 — workflow metadata was stale

`docs/LEXCHAIN-SYSTEM-WORKFLOW.md` now records the 2026-07-27 update date.

## TDD evidence

The final wave followed RED/GREEN for behavior changes:

| Regression | RED evidence | GREEN evidence |
| --- | --- | --- |
| Page authority, invitation validation, participant navigation, malformed cookie | Initial focused run failed 27 assertions against the reviewed implementation | 8 focused files, 48 tests passed |
| Participant shell logo | Expected `/portal/documents`, received `/portal/dashboard` | 3 focused files, 9 tests passed |
| Sidebar button semantics | Expected explicit `type="button"`, received no type | Focused layout test passed |

React Doctor independently found the sidebar-button issue in the changed
layout. After the fix, its branch scan moved from 82 to 81 warnings. The
remaining warnings span broad pre-existing code and were not expanded into
this bounded authorization/navigation repair.

## Automated verification

Fresh final commands:

| Command | Result |
| --- | --- |
| `pnpm --filter @lexchain/web test` | Pass: 64 files, 343 tests |
| `pnpm --filter @lexchain/web lint` | Pass: ESLint exit 0 |
| `pnpm --filter @lexchain/web build` | Pass: compiled, type-checked, 68 routes generated |
| `git diff --check` | Pass |
| Target application terminology scan | No active tier-model matches |
| Target documentation terminology scan | No stale target-model matches in existing files |
| Legacy account fixture scan | Deliberate negative tests plus unrelated user/AI chat-message discriminants only |

The production build emitted the known multiple-worktree-lockfile root
inference warning only.

## Browser and transport verification

The verified production build ran with:

```bash
USE_MOCK_API=true pnpm --filter @lexchain/web start --hostname 127.0.0.1 --port 3216
```

### Document Issuer

- Desktop `1440x1000`: exact actor identity, five navigation groups, five
  management routes and expected headings, and `/admin/users` compatibility
  redirect.
- Mobile `390x844`: every management destination visibly labeled and
  reachable; 0px overflow on each page.

### Document Participant

- Desktop: login landed at `/portal/documents`; the shell contained only
  participant destinations and no Processing Monitor.
- All five direct management routes were denied before management content.
- Both the duplicated participant issuer cookie and arbitrary forged issuer
  cookie were denied.
- Mobile `390x844`: documents, invitations, personal e-copy requests,
  notifications, and profile all rendered with 0px overflow and the four
  participant labels only.

### Invitation transport

| Request | Observed status |
| --- | --- |
| Anonymous canonical payload | 401 |
| Participant credential | 403 |
| Issuer with invalid JSON | 400 |
| Issuer with invalid email | 400 |
| Issuer with legacy role | 400 |
| Issuer with canonical payload | 201 |

All four full-matrix browser sessions reported zero console errors and zero
console warnings. A post-commit smoke of the final production build reconfirmed
issuer management access, participant denial, participant mobile labels,
0px overflow, and the explicit sidebar button type.

All browser sessions were closed. Both acceptance servers were stopped with
`SIGINT`; port `3216` had no remaining listener.

## Files and commits

Implementation and tests:
`5c2e59bd7f017a96af0c2421c05b462737242a42`

The final evidence set comprises this report, the refreshed status document,
the refreshed acceptance document, and the Task 7 addendum.

The implementation stayed inside `apps/web` and the approved documentation
files. It did not modify backend, database, OpenAPI, generated types, mobile,
Draw.io, dependencies, or the lockfile.

## Concerns and honest limitations

- Browser acceptance used seeded web mock data. It does not prove backend,
  database, OpenAPI, mobile, email, blockchain, or persistence integration.
- The source scan's planned
  `docs/LEXCHAIN-END-TO-END-TEST-FLOW.md` input does not exist in the worktree
  or repository history; all existing target inputs were scanned.
- React Doctor still reports 81 broad branch warnings. The one warning directly
  introduced/exposed in the changed layout was fixed; the rest require
  separate, scoped triage rather than an authorization fix-wave expansion.
- The production build still emits the existing worktree-root inference
  warning. Compilation, type checking, and route generation remain green.
