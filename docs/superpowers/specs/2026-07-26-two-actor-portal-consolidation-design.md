# LexChain Two-Actor Portal Consolidation Design

**Date:** 2026-07-26
**Authority:** `docs/cfd_last.drawio` and `docs/use_case_last.drawio`

## Purpose

Align the web UI with the updated diagrams, which define only two external
actors:

1. **Document Issuer (Lawyer + Super Admin)**
2. **Document Participant**

`Super Admin` is a permission level within the Document Issuer actor. It is
not a third actor and must not have a separate product workspace.

## Current mismatch

- Lawyer accounts enter `/portal/dashboard`.
- Admin accounts enter `/admin/dashboard`.
- `/admin/dashboard` presents a separate admin-style application shell.
- Documentation lists Admin separately from Document Issuer.

This route and copy structure contradicts the updated CFD and use-case
diagram even though the management capabilities themselves are required.

## Approaches considered

### 1. Delete `/admin/dashboard` immediately

Smallest deletion, but unsafe. Login redirects, bookmarks, tests, and links
would break, and the required Super Admin capabilities would remain stranded.

### 2. Redirect only `/admin/dashboard`

Avoids a broken landing page, but leaves Users, Invitations, Reports, and
Audit Logs inside a visibly separate Admin workspace. This fixes the URL but
not the actor-model mismatch.

### 3. Consolidate required management capabilities into `/portal` (selected)

Use one portal shell for both actors. Document Issuers with Super Admin
permission receive an additional management navigation group. Legacy
`/admin/*` target routes redirect to their `/portal/*` replacements so old
links remain safe while the separate dashboard UI is retired.

This is the smallest approach that fixes both the navigation and actor model.

## Actor and permission mapping

Reuse the current backend role values; do not add a new database role model.

| Backend role | Product actor | Permission level |
| --- | --- | --- |
| `lawyer` | Document Issuer | Standard issuer |
| `admin`, `super_admin`, supported owner aliases | Document Issuer | Super Admin |
| `user` | Document Participant | Participant |

The UI may display `Document Issuer · Super Admin` for the privileged issuer,
but must never list Admin as a separate actor.

## Navigation and routes

### Shared entry

- All supported authenticated roles enter `/portal/dashboard`.
- `/admin/dashboard` becomes a server redirect to `/portal/dashboard`.
- The old dashboard component is deleted; no duplicate dashboard remains.

### Standard Document Issuer

Keeps the existing issuer navigation and document workflows.

### Super Admin Document Issuer

Receives an additional **Super Admin** navigation group inside the portal:

- User Accounts → `/portal/users`
- Issuer Invitations → `/portal/issuer-invitations`
- System Reports → `/portal/system-reports`
- Audit Logs → `/portal/audit-logs`
- System Statistics → `/portal/system-statistics`

The existing management views and data loaders are reused. They must render
inside the portal shell rather than being copied or rebuilt.

### Legacy route compatibility

The target legacy routes redirect as follows:

| Legacy route | Portal route |
| --- | --- |
| `/admin/dashboard` | `/portal/dashboard` |
| `/admin/users` | `/portal/users` |
| `/admin/invitations-permissions` | `/portal/issuer-invitations` |
| `/admin/generated-reports` | `/portal/system-reports` |
| `/admin/audit-logs` | `/portal/audit-logs` |

Other legacy admin-template routes are removed from navigation and remain out
of scope unless they map to a use case in the updated diagrams.

## Dashboard behavior

`/portal/dashboard` remains the only dashboard.

- Standard issuers see their office/document overview.
- Super Admin issuers additionally see a compact system-statistics section
  derived from the existing admin dashboard data.
- Participants retain their restricted shared-document experience.

Generic dashboard-template content that is not supported by a target use case
is not migrated.

## Authorization

- Navigation visibility is UX only, not authorization.
- Portal pages for Super Admin capabilities require the existing server-issued
  `admin_token` in addition to the portal session.
- Standard issuers and participants receive a denial or safe redirect; they
  cannot load privileged data by typing a URL.
- Existing backend proxy contracts remain unchanged.

## Mock-mode behavior

- Mock admin authentication must also create a portal profile representing a
  Document Issuer with Super Admin permission.
- Existing demo user mutations and reports remain session-local and keep their
  demo disclaimers.
- No new mock database, persistence layer, or global state is introduced.

## Documentation corrections

- Replace the separate Admin section in the web status document with
  **Document Issuer — Super Admin capabilities**.
- Keep only Document Issuer and Document Participant in the actor matrix.
- Public verification may remain an anonymous feature, but it is not described
  as a third registered actor.
- Update the backend handoff wording where it treats Admin as a separate actor.

## Testing

Use TDD for each behavior change:

- Admin/Super Admin login redirects to `/portal/dashboard`.
- Lawyer and participant redirects remain correct.
- Admin profile maps to Document Issuer with Super Admin permission.
- Super Admin navigation is visible only to privileged issuers.
- New portal management routes render the existing management views.
- Standard issuers and participants cannot access privileged portal routes.
- Every target legacy `/admin/*` route redirects correctly.
- `/admin/dashboard` no longer renders the old dashboard UI.
- Status documentation contains only the two authoritative actors.

Run the full web test suite, lint, production build, and a role-based browser
walkthrough before completion.

## Explicit non-goals

- No mobile changes.
- No FastAPI implementation or contract changes.
- No database migration or new role field.
- No new dependency or design system.
- No rewrite of existing management views.
- No migration of legacy admin-template pages that are absent from the updated
  use-case diagram.

## Success criteria

- Users encounter one LexChain portal, not separate Portal and Admin products.
- The UI and documentation expose exactly two actors.
- Super Admin capabilities remain available as permissions of Document Issuer.
- Old `/admin` target links resolve safely without exposing the retired admin
  dashboard.
