# Single Document Issuer Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the web portal so its only actors are `Document Issuer` and `Document Participant`, with every diagram-assigned issuer capability available to every Document Issuer.

**Architecture:** Keep the existing unified `/portal` shell and existing management views. Replace the current lawyer/admin tier mapping with the canonical role values `document_issuer` and `document_participant`, issue one server-side `issuer_token` for issuer-only access, and make the five existing management destinations an unconditional `System Management` section for Document Issuers. Keep `/admin/*` only as legacy page redirects and retain `/api/admin/*` only as internal transport names where renaming would add churn.

**Tech Stack:** Next.js 16 App Router and proxy, React 19, TypeScript, Vitest, Testing Library, Tailwind CSS v4, pnpm.

## Global Constraints

- Source of truth: `docs/use_case_last.drawio` and `docs/superpowers/specs/2026-07-26-single-document-issuer-role-design.md`.
- The complete actor set is exactly `Document Issuer` and `Document Participant`.
- Canonical role values are exactly `document_issuer` and `document_participant`.
- Do not accept `lawyer`, `admin`, `super_admin`, `owner`, or `user` as target role aliases. The backend is not yet updated, so do not add compatibility mapping.
- Display only `Document Issuer` or `Document Participant`; remove `Standard`, `Super User`, and `Super Admin` role/tier copy.
- Every Document Issuer receives all issuer use cases from the updated use-case diagram, including user accounts, issuer invitations, system reports, audit logs, and system statistics.
- Keep authorization server-side. `issuer_token` is the authority for issuer-only routes; `user_role` is never authorization.
- Reuse existing portal pages, management views, API proxy routes, and mock store. Do not build a new admin console, permission framework, role hierarchy, or navigation system.
- Preserve `/admin/*` page redirects. Existing `/api/admin/*` route names and internal `Admin*` transport/schema type names may remain when they are not visible to users.
- Do not modify `apps/mobile`, FastAPI, `openapi-updated.json`, generated types, database schema, Draw.io files, workspace dependencies, or lockfiles.
- Use `pnpm` only and keep `lightningcss` pinned to `1.30.1`.
- Before changing Next.js cookies, proxy behavior, or redirects, read the relevant local docs under `apps/web/node_modules/next/dist/docs/`, especially the cookie, redirect, route-handler, and proxy references.
- Follow red-green-refactor within each task. At each review gate, inspect `git diff --check` and the scoped diff before committing.

---

### Task 1: Replace the tiered role model with the two canonical actors

**Files:**
- Modify: `apps/web/app/portal/lib/portal-role.ts`
- Modify: `apps/web/app/portal/lib/portal-role.test.ts`
- Modify: `apps/web/app/portal/layout.tsx`

**Contract:**
- `getPortalUiRole("document_issuer") === "issuer"`
- `getPortalUiRole("document_participant") === "participant"`
- old role values resolve to `unsupported`
- role labels are exact actor names
- `isPortalSuperAdminRole` no longer exists

- [ ] **Step 1: Write the failing canonical-role tests**

Replace the tier assertions with:

```ts
expect(getPortalUiRole("document_issuer")).toBe("issuer");
expect(getPortalRoleLabel("document_issuer")).toBe("Document Issuer");
expect(getPortalUiRole("document_participant")).toBe("participant");
expect(getPortalRoleLabel("document_participant")).toBe("Document Participant");

for (const obsoleteRole of ["lawyer", "admin", "super_admin", "owner", "user"]) {
  expect(getPortalUiRole(obsoleteRole)).toBe("unsupported");
}
```

Keep the existing supported-role redirect and profile-shortcut coverage, but use only canonical role inputs.

- [ ] **Step 2: Run the focused test and confirm RED**

```bash
pnpm --filter @lexchain/web exec vitest run app/portal/lib/portal-role.test.ts
```

Expected: the canonical values are unsupported and old aliases are still accepted.

- [ ] **Step 3: Implement the smallest role mapping**

Keep the existing UI role type and shared helpers, but reduce the mapping to:

```ts
export function getPortalUiRole(role?: string): PortalUiRole {
  const normalized = role?.trim().toLowerCase();
  if (normalized === "document_issuer") return "issuer";
  if (normalized === "document_participant") return "participant";
  return "unsupported";
}

export function getPortalRoleLabel(role?: string): string {
  const uiRole = getPortalUiRole(role);
  if (uiRole === "issuer") return "Document Issuer";
  if (uiRole === "participant") return "Document Participant";
  return "LexChain User";
}
```

Delete `isPortalSuperAdminRole` and remove its import, derived boolean, and privilege arguments from `portal/layout.tsx`. The navigation helper and bottom-nav prop can still accept their existing optional argument until Task 2 removes those interfaces. Do not replace the deleted helper with another alias helper.

- [ ] **Step 4: Confirm GREEN and review the boundary**

```bash
pnpm --filter @lexchain/web exec vitest run app/portal/lib/portal-role.test.ts
rg -n "isPortalSuperAdminRole" apps/web
git diff --check
```

Expected: the focused test passes and the search has no application-code matches. `isAdminRole` remains temporarily in the unified auth path until Task 3 replaces that path and deletes the helper.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/portal/lib/portal-role.ts \
  apps/web/app/portal/lib/portal-role.test.ts \
  apps/web/app/portal/layout.tsx
git commit -m "refactor(web): use canonical portal actors"
```

---

### Task 2: Give every Document Issuer the complete portal navigation

**Files:**
- Modify: `apps/web/app/portal/lib/portal-dashboard.ts`
- Modify: `apps/web/app/portal/lib/portal-dashboard.test.ts`
- Modify: `apps/web/app/portal/components/portal-role-navigation.test.ts`
- Modify: `apps/web/app/portal/components/portal-bottom-nav.tsx`
- Modify: `apps/web/app/portal/components/portal-bottom-nav.test.tsx`

**Contract:**
- `getPortalNavigation(role)` has no privilege flag.
- Every issuer sees `Workspace`, `Integrity`, `Office`, `System Management`, and `Account`.
- `System Management` contains the five existing management destinations.
- Participants never receive issuer navigation.

- [ ] **Step 1: Rewrite navigation tests to describe one issuer**

Assert the issuer group labels exactly:

```ts
expect(getPortalNavigation("issuer").map((group) => group.label)).toEqual([
  "Workspace",
  "Integrity",
  "Office",
  "System Management",
  "Account",
]);
```

Assert `System Management` contains:

```ts
[
  ["User Accounts", "/portal/users"],
  ["Issuer Invitations", "/portal/issuer-invitations"],
  ["System Reports", "/portal/system-reports"],
  ["Audit Logs", "/portal/audit-logs"],
  ["System Statistics", "/portal/system-statistics"],
]
```

Remove all tests comparing privileged and standard issuers. In bottom-navigation coverage, render one issuer and assert all five links are reachable; retain the existing responsive overflow behavior.

- [ ] **Step 2: Run focused tests and confirm RED**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/portal/lib/portal-dashboard.test.ts \
  app/portal/components/portal-role-navigation.test.ts \
  app/portal/components/portal-bottom-nav.test.tsx
```

Expected: the current issuer navigation lacks the management group unless a privilege flag is supplied.

- [ ] **Step 3: Remove the privilege branch**

- Change `getPortalNavigation(role, superAdmin)` to `getPortalNavigation(role)`.
- Put the five existing entries directly in one `System Management` group in the issuer navigation array.
- Delete the `superAdmin` prop from `PortalBottomNav`.
- Keep `portal/layout.tsx` on the role-only calls established in Task 1; no new shell logic is needed.
- Keep the current portal shell, icons, active-route behavior, and mobile horizontal navigation; do not redesign the layout.

- [ ] **Step 4: Confirm GREEN and scan for tier UI**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/portal/lib/portal-dashboard.test.ts \
  app/portal/components/portal-role-navigation.test.ts \
  app/portal/components/portal-bottom-nav.test.tsx
rg -n "superAdmin|Super Admin|Super User|Standard Document Issuer" apps/web/app/portal
git diff --check
```

Expected: focused tests pass and the tier scan has no application-code matches.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/portal/lib/portal-dashboard.ts \
  apps/web/app/portal/lib/portal-dashboard.test.ts \
  apps/web/app/portal/components/portal-role-navigation.test.ts \
  apps/web/app/portal/components/portal-bottom-nav.tsx \
  apps/web/app/portal/components/portal-bottom-nav.test.tsx
git commit -m "fix(web): expose complete issuer navigation"
```

---

### Task 3: Issue one issuer session and guard issuer-only routes with it

**Files:**
- Modify: `apps/web/app/api/auth/route.ts`
- Modify: `apps/web/app/api/auth/route.test.ts`
- Delete: `apps/web/lib/admin-role.ts`
- Delete: `apps/web/lib/admin-role.test.ts`
- Delete: `apps/web/app/api/admin/auth/route.ts`
- Delete: `apps/web/app/api/admin/auth/route.test.ts`
- Delete: `apps/web/app/api/portal/auth/route.ts`
- Delete: `apps/web/app/api/portal/auth/route.test.ts`
- Modify: `apps/web/app/api/portal/logout/route.ts`
- Modify: `apps/web/app/api/portal/logout/route.test.ts`
- Modify: `apps/web/app/api/admin/logout/route.ts`
- Modify: `apps/web/app/api/admin/logout/route.test.ts`
- Modify: `apps/web/proxy.ts`
- Modify: `apps/web/lib/admin-access.test.ts`
- Modify: `apps/web/lib/admin-api.ts`
- Modify: `apps/web/app/admin/components/admin-fetch.ts`
- Modify: `apps/web/app/admin/actions.ts`

**Contract:**
- Unified `/api/auth` mock mode exposes only `issuer@example.com` and `participant@example.com` with password `Password123`.
- Both actors receive `portal_token`; only the issuer receives `issuer_token`.
- A participant login deletes any stale `issuer_token` and `admin_token`.
- The five issuer-management routes require `portal_token` plus `issuer_token`.
- A forged `user_role` or stale `admin_token` grants nothing.
- Both logout endpoints clear `portal_token`, `issuer_token`, stale `admin_token`, and `user_role`.

- [ ] **Step 1: Write failing auth, logout, and proxy tests**

In the auth route test, assert:

```ts
const issuer = await POST(credentials("issuer@example.com"));
expect(issuer.cookies.get("portal_token")?.value).toBe("mock-token:mock-document-issuer");
expect(issuer.cookies.get("issuer_token")?.value).toBe("mock-token:mock-document-issuer");
expect(issuer.cookies.get("issuer_token")?.httpOnly).toBe(true);

const participant = await POST(credentials("participant@example.com"));
expect(participant.cookies.get("portal_token")?.value).toBe("mock-token:mock-document-participant");
expect(participant.cookies.get("issuer_token")?.maxAge).toBe(0);
expect(participant.cookies.get("admin_token")?.maxAge).toBe(0);
```

Rename `SUPER_ADMIN_PORTAL_PATHS` to `ISSUER_MANAGEMENT_PATHS`. Update proxy cases to prove:

```text
portal_token + issuer_token -> issuer management route continues
portal_token only -> redirect /portal/dashboard
admin_token + portal_token, without issuer_token -> redirect /portal/dashboard
issuer_token only -> redirect /login
no cookies -> redirect /login
```

Keep all `/admin/*` legacy page redirect assertions and `/api/admin/*` pass-through assertions.

- [ ] **Step 2: Run focused tests and confirm RED**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/api/auth/route.test.ts \
  app/api/portal/logout/route.test.ts \
  app/api/admin/logout/route.test.ts \
  lib/admin-access.test.ts
```

- [ ] **Step 3: Implement the canonical session boundary**

- Reduce the unified auth mock accounts to the two canonical identities and roles.
- In real mode, issue `issuer_token` only when the returned profile role is exactly `document_issuer`; do not map old backend roles.
- Delete the now-unused `admin-role` helper and test instead of replacing them with a new role hierarchy.
- Preserve secure cookie settings already used by `portal_token` (`httpOnly`, `sameSite`, `secure` in production, and path).
- Rename the proxy constant and replace the management-route `admin_token` check with `issuer_token`.
- Change `lib/admin-api.ts`, `admin/components/admin-fetch.ts`, and `admin/actions.ts` to forward `issuer_token` for the reused `/api/admin/*` transport calls.
- Delete the two unused alternate login endpoints. They have no callers outside their own tests; `/api/auth` remains the single login route.
- Update both logout routes to clear the new token plus stale old cookies.
- Do not rename `/api/admin/*`, schema properties such as `total_lawyers`, or internal helper filenames in this task; those are transport details and renaming them would not change the product model.

- [ ] **Step 4: Confirm GREEN and run security scans**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/api/auth/route.test.ts \
  app/api/portal/logout/route.test.ts \
  app/api/admin/logout/route.test.ts \
  lib/admin-access.test.ts
rg -n "admin_token|isAdminRole|/api/admin/auth|/api/portal/auth" apps/web \
  --glob '!**/*.test.*'
git diff --check
```

Expected: only deliberate stale-cookie cleanup may mention `admin_token`; no code accepts it as authority and obsolete auth routes are gone.

- [ ] **Step 5: Commit**

```bash
git add -A apps/web/app/api/auth apps/web/app/api/admin/auth \
  apps/web/app/api/portal/auth apps/web/app/api/portal/logout \
  apps/web/app/api/admin/logout apps/web/proxy.ts \
  apps/web/lib/admin-role.ts apps/web/lib/admin-role.test.ts \
  apps/web/lib/admin-access.test.ts apps/web/lib/admin-api.ts \
  apps/web/app/admin/components/admin-fetch.ts apps/web/app/admin/actions.ts
git commit -m "fix(web): authorize issuer management with issuer session"
```

---

### Task 4: Canonicalize mock identities and issuer action authorization

**Files:**
- Modify: `apps/web/lib/portal-mock.ts`
- Modify: `apps/web/lib/portal-mock.test.ts`
- Modify: `apps/web/app/api/portal/blockchain/verify/[id]/route.test.ts`
- Modify: `apps/web/app/api/portal/blockchain/record/[id]/route.test.ts`
- Modify: `apps/web/app/api/portal/documents/[id]/audit-logs/route.test.ts`
- Modify: `apps/web/app/api/portal/documents/[id]/parties/route.test.ts`
- Modify: `apps/web/app/api/portal/documents/[id]/parties/[partyUserId]/route.test.ts`
- Modify: `apps/web/app/portal/lib/office-insight.test.ts`
- Modify: `apps/web/app/portal/reports/page.test.tsx`

**Contract:**
- Mock mode recognizes only `mock-token:mock-document-issuer` and `mock-token:mock-document-participant` as account sessions.
- The mock profiles return canonical role values and actor-facing email/name data.
- The issuer can exercise document lifecycle, integrity, participant-access, reporting, and audit functions.
- The participant remains restricted from issuer-only mutations and management routes.

- [ ] **Step 1: Rewrite mock-boundary tests first**

Replace mock admin/lawyer/owner personas with one issuer profile and replace the mock user persona with one participant profile. Add explicit assertions:

```ts
await expect(mockPortalGet("/users/", "mock-token:mock-document-issuer").json())
  .resolves.toMatchObject({ role: "document_issuer", email: "issuer@example.com" });

await expect(mockPortalGet("/users/", "mock-token:mock-document-participant").json())
  .resolves.toMatchObject({ role: "document_participant", email: "participant@example.com" });

expect(isMockPortalToken("mock-token:mock-admin")).toBe(false);
expect(isMockPortalToken("mock-token:mock-lawyer")).toBe(false);
expect(isMockPortalToken("mock-token:mock-owner")).toBe(false);
```

Update route tests so issuer authorization fixtures return `role: "document_issuer"`; participant fixtures return `role: "document_participant"`. Test titles must say `Document Issuer`, not `Super Admin` or `lawyer`.

- [ ] **Step 2: Run the mock and authorization tests and confirm RED**

```bash
pnpm --filter @lexchain/web exec vitest run \
  lib/portal-mock.test.ts \
  app/api/portal/blockchain/verify/[id]/route.test.ts \
  app/api/portal/blockchain/record/[id]/route.test.ts \
  app/api/portal/documents/[id]/audit-logs/route.test.ts \
  app/api/portal/documents/[id]/parties/route.test.ts \
  app/api/portal/documents/[id]/parties/[partyUserId]/route.test.ts \
  app/portal/lib/office-insight.test.ts \
  app/portal/reports/page.test.tsx
```

- [ ] **Step 3: Simplify the existing mock store**

- Rename the existing issuer profile/token identifiers to `mock-document-issuer` and use role `document_issuer`.
- Rename the existing participant profile/token identifiers to `mock-document-participant` and use role `document_participant`.
- Delete `superAdminProfile`, owner/admin token branches, and `isMockSuperAdmin`.
- Keep all existing mock document data and mutation behavior; only actor identity and authorization change.
- Mechanically update test tokens and expected actor IDs. Do not add another mock store or migration layer.

- [ ] **Step 4: Confirm GREEN and scan for obsolete mock personas**

Run the Step 2 command, then:

```bash
rg -n "mock-(admin|lawyer|owner|user)|Super Admin|Super User" apps/web \
  --glob '!**/.playwright-cli/**'
git diff --check
```

Expected: focused tests pass and the obsolete-persona scan has no source/test matches.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/portal-mock.ts apps/web/lib/portal-mock.test.ts \
  apps/web/app/api/portal/blockchain/verify/[id]/route.test.ts \
  apps/web/app/api/portal/blockchain/record/[id]/route.test.ts \
  apps/web/app/api/portal/documents/[id]/audit-logs/route.test.ts \
  apps/web/app/api/portal/documents/[id]/parties/route.test.ts \
  apps/web/app/api/portal/documents/[id]/parties/[partyUserId]/route.test.ts \
  apps/web/app/portal/lib/office-insight.test.ts \
  apps/web/app/portal/reports/page.test.tsx
git commit -m "test(web): use two canonical mock actors"
```

---

### Task 5: Remove Admin-versus-Lawyer choices from reused management UI

**Files:**
- Modify: `apps/web/app/admin/users/users-management-view.tsx`
- Modify: `apps/web/app/admin/users/users-management-view.test.tsx`
- Modify: `apps/web/app/admin/invitations-permissions/create-invitation-modal.tsx`
- Modify: `apps/web/app/admin/invitations-permissions/invitations-management-view.tsx`
- Modify: `apps/web/app/admin/generated-reports/generated-reports-management-view.tsx`
- Modify: `apps/web/app/portal/system-statistics/system-statistics-view.tsx`
- Modify: `apps/web/app/portal/system-statistics/system-statistics-view.test.tsx`
- Rename: `apps/web/app/portal/lib/super-admin-pages.test.ts` to `apps/web/app/portal/lib/issuer-management-pages.test.ts`

**Contract:**
- User rows and edit controls display only `Document Issuer` and `Document Participant`.
- Issuer invitation creation sends only `document_issuer`; it does not expose a role picker because the destination is specifically Issuer Invitations.
- Management-page headings/descriptions contain no separate Admin actor or privilege tier.
- Existing `/portal/users`, `/portal/issuer-invitations`, `/portal/system-reports`, `/portal/audit-logs`, and `/portal/system-statistics` views continue to be reused.

- [ ] **Step 1: Update tests before production copy**

- Change user fixtures to canonical roles.
- Assert the edit form options are exactly `Document Issuer` and `Document Participant`.
- Assert current-account suspension protection still works without naming the account Admin.
- Rename the five-page source contract test and change its descriptions from Super Admin pages to issuer management pages.
- In system-statistics tests, assert the user-facing description says `issuer management service` or neutral `system service`, not `admin dashboard service`.

- [ ] **Step 2: Run focused tests and confirm RED**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/admin/users/users-management-view.test.tsx \
  app/portal/system-statistics/system-statistics-view.test.tsx \
  app/portal/lib/issuer-management-pages.test.ts
```

The renamed test path may initially fail to resolve until the file move is staged; that is part of the expected RED state.

- [ ] **Step 3: Make only the visible management corrections**

- Map `document_issuer` to `Document Issuer` and `document_participant` to `Document Participant` in the reused users view.
- Offer exactly those two canonical values when editing an account.
- Replace the issuer invitation role dropdown with the fixed submitted value `document_issuer`; keep email validation and existing submit behavior.
- Replace `lawyer`/`admin` invitation copy with `Document Issuer` copy.
- Replace visible `admin`/`Super Admin` descriptions in the reused invitation, report, and statistics views with issuer/system wording.
- Keep internal component names, `/api/admin/*` fetch URLs, backend response property names, and styling unchanged.

- [ ] **Step 4: Confirm GREEN and inspect product-facing copy**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/admin/users/users-management-view.test.tsx \
  app/portal/system-statistics/system-statistics-view.test.tsx \
  app/portal/lib/issuer-management-pages.test.ts
rg -n "Super Admin|Super User|Standard Document Issuer|>Admin<|>Lawyer<|admin invitations" \
  apps/web/app/portal \
  apps/web/app/admin/users/users-management-view.tsx \
  apps/web/app/admin/invitations-permissions \
  apps/web/app/admin/generated-reports/generated-reports-management-view.tsx
git diff --check
```

Expected: focused tests pass and no product-facing tier labels remain. Internal identifiers are allowed only where the scan proves they are not rendered copy.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/admin/users/users-management-view.tsx \
  apps/web/app/admin/users/users-management-view.test.tsx \
  apps/web/app/admin/invitations-permissions/create-invitation-modal.tsx \
  apps/web/app/admin/invitations-permissions/invitations-management-view.tsx \
  apps/web/app/admin/generated-reports/generated-reports-management-view.tsx \
  apps/web/app/portal/system-statistics/system-statistics-view.tsx \
  apps/web/app/portal/system-statistics/system-statistics-view.test.tsx \
  apps/web/app/portal/lib/super-admin-pages.test.ts \
  apps/web/app/portal/lib/issuer-management-pages.test.ts
git commit -m "fix(web): normalize issuer management UI"
```

---

### Task 6: Correct architecture, workflow, backend-handoff, and test documentation

**Files:**
- Modify: `docs/LEXCHAIN-DRAWIO-TARGET-SYSTEM-DESIGN.md`
- Modify: `docs/LEXCHAIN-TARGET-SYSTEM-ARCHITECTURE.md`
- Modify: `docs/LEXCHAIN-SYSTEM-UNDERSTANDING.md`
- Modify: `docs/LEXCHAIN-SYSTEM-WORKFLOW.md`
- Modify: `docs/LEXCHAIN-WORKFLOW-FLOWCHARTS.md`
- Modify: `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`
- Modify: `docs/LEXCHAIN-WEB-TARGET-UI-UX-STATUS.md`
- Modify: `docs/LEXCHAIN-END-TO-END-TEST-FLOW.md`

**Contract:**
- Every current/target architecture actor list has exactly two registered actors.
- Parenthetical `Lawyer + Super Admin` is explained only as the identity of the one Document Issuer actor, never permission tiers.
- Backend handoff requests the canonical role values and complete issuer authorization; it does not preserve old aliases.
- Workflow diagrams show one login/session path and one issuer management flow.
- Mock test instructions use the two canonical accounts.

- [ ] **Step 1: Record the failing terminology scan**

```bash
rg -n "standard Document Issuer|Super Admin capabilities|Super Admin console|admin_token|role: user \| lawyer \| admin|admin@example.com|lawyer@example.com|user@example.com" \
  docs/LEXCHAIN-DRAWIO-TARGET-SYSTEM-DESIGN.md \
  docs/LEXCHAIN-TARGET-SYSTEM-ARCHITECTURE.md \
  docs/LEXCHAIN-SYSTEM-UNDERSTANDING.md \
  docs/LEXCHAIN-SYSTEM-WORKFLOW.md \
  docs/LEXCHAIN-WORKFLOW-FLOWCHARTS.md \
  docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md \
  docs/LEXCHAIN-WEB-TARGET-UI-UX-STATUS.md \
  docs/LEXCHAIN-END-TO-END-TEST-FLOW.md
```

Expected: the scan reports the stale three-role/tier model.

- [ ] **Step 2: Update the docs from the diagram-derived capability lists**

- Use exactly the 19 issuer use cases and 7 participant use cases recorded in the approved design spec.
- Collapse actor matrices and Mermaid diagrams to Document Issuer and Document Participant.
- Describe the five management destinations as ordinary Document Issuer capabilities under `System Management`.
- Specify backend target roles as `document_issuer | document_participant` and require issuer-only endpoint authorization from the authenticated issuer role.
- Replace `admin_token` target guidance with `issuer_token` and explicitly reject client-readable role hints as authority.
- Keep `/api/admin/*` endpoint names documented as temporary web transport names, not an Admin actor.
- Update mock credentials to `issuer@example.com` and `participant@example.com`, password `Password123`.
- Do not rewrite historical files under `docs/superpowers/plans/` or older superseded design specs; the new design and this plan supersede them.

- [ ] **Step 3: Validate diagrams and prose mechanically**

```bash
rg -n "standard Document Issuer|Super Admin capabilities|Super Admin console|admin_token|role: user \| lawyer \| admin|admin@example.com|lawyer@example.com|user@example.com" \
  docs/LEXCHAIN-DRAWIO-TARGET-SYSTEM-DESIGN.md \
  docs/LEXCHAIN-TARGET-SYSTEM-ARCHITECTURE.md \
  docs/LEXCHAIN-SYSTEM-UNDERSTANDING.md \
  docs/LEXCHAIN-SYSTEM-WORKFLOW.md \
  docs/LEXCHAIN-WORKFLOW-FLOWCHARTS.md \
  docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md \
  docs/LEXCHAIN-WEB-TARGET-UI-UX-STATUS.md \
  docs/LEXCHAIN-END-TO-END-TEST-FLOW.md
git diff --check
```

Expected: no stale target-model matches. Mentions of lawyer-specific ERD field names such as `lawyer_id` may remain because the Draw.io ERD defines them; explain them as schema names, not roles.

- [ ] **Step 4: Commit**

```bash
git add docs/LEXCHAIN-DRAWIO-TARGET-SYSTEM-DESIGN.md \
  docs/LEXCHAIN-TARGET-SYSTEM-ARCHITECTURE.md \
  docs/LEXCHAIN-SYSTEM-UNDERSTANDING.md \
  docs/LEXCHAIN-SYSTEM-WORKFLOW.md \
  docs/LEXCHAIN-WORKFLOW-FLOWCHARTS.md \
  docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md \
  docs/LEXCHAIN-WEB-TARGET-UI-UX-STATUS.md \
  docs/LEXCHAIN-END-TO-END-TEST-FLOW.md
git commit -m "docs: align LexChain with two canonical actors"
```

---

### Task 7: Run full verification and replace browser acceptance evidence

**Files:**
- Rewrite: `docs/LEXCHAIN-TWO-ACTOR-PORTAL-ACCEPTANCE.md`

**Acceptance matrix:**

| Persona | Required result |
|---|---|
| Document Issuer | Exact role label; all five navigation groups; all five System Management pages reachable on desktop and mobile |
| Document Participant | Exact role label; participant navigation only; direct issuer-management URLs safely denied |
| Legacy URL | `/admin/*` resolves to its `/portal/*` compatibility target without exposing an Admin workspace |

- [ ] **Step 1: Run all automated checks**

From the repository root:

```bash
pnpm --filter @lexchain/web test
pnpm --filter @lexchain/web lint
pnpm --filter @lexchain/web build
git diff --check
```

Expected: the full web suite, lint, and production build pass.

- [ ] **Step 2: Run final source scans**

```bash
rg -n "isPortalSuperAdminRole|isAdminRole|Super Admin|Super User|Standard Document Issuer" apps/web

rg -n "standard Document Issuer|Super Admin capabilities|Super Admin console|admin_token" \
  docs/LEXCHAIN-DRAWIO-TARGET-SYSTEM-DESIGN.md \
  docs/LEXCHAIN-TARGET-SYSTEM-ARCHITECTURE.md \
  docs/LEXCHAIN-SYSTEM-UNDERSTANDING.md \
  docs/LEXCHAIN-SYSTEM-WORKFLOW.md \
  docs/LEXCHAIN-WORKFLOW-FLOWCHARTS.md \
  docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md \
  docs/LEXCHAIN-WEB-TARGET-UI-UX-STATUS.md \
  docs/LEXCHAIN-END-TO-END-TEST-FLOW.md

rg -n "role:\s*[\"'](admin|super_admin|lawyer|user)[\"']|mock-(admin|lawyer|owner|user)" \
  apps/web --glob '!**/.playwright-cli/**'
```

Expected: no active target-model matches. The Draw.io documentation may quote the raw actor annotation `Lawyer + Super Admin` only while explaining that it is one Document Issuer actor. Internal `/api/admin/*`, `Admin*` type/component identifiers, old-plan history, and ERD field names are outside this scan by design.

- [ ] **Step 3: Start the verified production build**

```bash
USE_MOCK_API=true pnpm --filter @lexchain/web start --hostname 127.0.0.1 --port 3216
```

Keep the process running only for the acceptance walk-through.

- [ ] **Step 4: Verify the Document Issuer on desktop**

Using Playwright or the installed browser automation skill:

1. Open `http://127.0.0.1:3216/login` at a desktop viewport.
2. Sign in with `issuer@example.com` / `Password123`.
3. Confirm `/portal/dashboard` and exact `Document Issuer` profile copy.
4. Confirm group labels `Workspace`, `Integrity`, `Office`, `System Management`, and `Account`.
5. Open each of `/portal/users`, `/portal/issuer-invitations`, `/portal/system-reports`, `/portal/audit-logs`, and `/portal/system-statistics`; confirm its page heading and no Admin/Super Admin tier copy.
6. Open `/admin/users`; confirm it resolves to `/portal/users`.

- [ ] **Step 5: Verify the Document Participant on desktop**

1. Sign out and sign in with `participant@example.com` / `Password123`.
2. Confirm `/portal/dashboard` and exact `Document Participant` profile copy.
3. Confirm only participant destinations are present.
4. Directly open each of the five issuer-management URLs and confirm safe denial/redirect to `/portal/dashboard` with no management content rendered.
5. Confirm a client-side `user_role=document_issuer` cookie cannot bypass the denial.

- [ ] **Step 6: Verify responsive issuer access**

1. Resize to `390x844`.
2. Sign in as the Document Issuer.
3. Confirm the mobile navigation can reach all five System Management destinations without clipping the active content or requiring a separate Admin shell.
4. Confirm visible labels contain only `Document Issuer`.

- [ ] **Step 7: Rewrite the acceptance document from observed evidence**

Replace the old admin-versus-lawyer transcript in `docs/LEXCHAIN-TWO-ACTOR-PORTAL-ACCEPTANCE.md` with:

- date, commit, build command, and viewport;
- the three-row acceptance matrix above;
- exact routes checked;
- exact two mock identities used;
- pass/fail results observed in this run;
- any honest limitation or blocker.

Do not claim browser checks that were not actually run.

- [ ] **Step 8: Re-run docs and diff checks, then commit**

```bash
rg -n "admin@example.com|lawyer@example.com|user@example.com|Super Admin|Super User|standard issuer" \
  docs/LEXCHAIN-TWO-ACTOR-PORTAL-ACCEPTANCE.md
git diff --check
git status --short
git add docs/LEXCHAIN-TWO-ACTOR-PORTAL-ACCEPTANCE.md
git commit -m "docs(web): verify canonical two-actor portal"
```

Expected: the acceptance scan is empty and only deliberate post-plan changes have been committed.

---

## Final Review Gate

- [ ] Compare the final behavior against all 19 Document Issuer and 7 Document Participant use cases in the approved design spec.
- [ ] Confirm there is no conditional issuer tier, no separate Admin workspace, and no compatibility authorization for old role values.
- [ ] Confirm `/admin/*` page redirects still work and `/api/admin/*` remains only an internal transport namespace.
- [ ] Confirm every Document Issuer receives the management pages and every Document Participant is denied them server-side.
- [ ] Confirm the full web tests, lint, build, source scans, desktop acceptance, and `390x844` acceptance are green.
- [ ] Run `git status --short` and review `git log --oneline -8` before handoff.
