# LexChain Two-Actor Portal Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the separate Admin product experience with Super Admin capabilities inside the single Document Issuer portal while preserving Document Participant restrictions and legacy-link compatibility.

**Architecture:** Extend the existing portal role mapping so backend admin roles resolve to the Document Issuer actor with a Super Admin permission flag. Reuse existing management view components under new `/portal/*` pages, protect those pages with the existing server-issued `admin_token`, and redirect every legacy `/admin/*` page away from the retired Admin shell.

**Tech Stack:** Next.js 16 App Router and proxy, React 19, TypeScript, TanStack Query, Vitest, Testing Library, Tailwind CSS v4.

## Global Constraints

- The authoritative actors are only `Document Issuer (Lawyer + Super Admin)` and `Document Participant`.
- `Super Admin` is a Document Issuer permission level, never a third actor.
- `/portal/dashboard` is the only authenticated dashboard.
- Do not modify `apps/mobile`, FastAPI, `openapi-updated.json`, generated types, database schema, workspace dependencies, or lockfiles.
- Reuse current management views, API routes, proxy helpers, mock data, and portal shell before adding code.
- Keep production authorization server-side; conditional navigation is UX only.
- Keep mock mutations and reports honestly labeled as demo behavior.
- Use `pnpm` only and keep `lightningcss` pinned.
- Before modifying Next.js routing or redirects, read:
  - `apps/web/node_modules/next/dist/docs/01-app/02-guides/redirecting.md`
  - `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`
  - `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`

---

### Task 1: Map Super Admin into the Document Issuer actor

**Files:**
- Modify: `apps/web/app/portal/lib/portal-role.ts`
- Modify: `apps/web/app/portal/lib/portal-role.test.ts`
- Modify: `apps/web/app/login/page.tsx`
- Modify: `apps/web/app/login/page.test.ts`
- Modify: `apps/web/lib/portal-mock.ts`
- Modify: `apps/web/lib/portal-mock.test.ts`

**Interfaces:**
- Produces: `isPortalSuperAdminRole(role?: string): boolean`
- Produces: `getPortalUiRole("admin" | "super_admin") === "issuer"`
- Produces: mock portal profiles for `mock-token:mock-admin` and `mock-token:mock-owner`
- Consumes: existing `isAdminRole()` aliases without adding a new role store

- [ ] **Step 1: Write failing role and redirect tests**

Add assertions equivalent to:

```ts
expect(getPortalUiRole("admin")).toBe("issuer");
expect(getPortalRoleLabel("admin")).toBe("Document Issuer · Super Admin");
expect(isPortalSuperAdminRole("admin")).toBe(true);
expect(isPortalSuperAdminRole("lawyer")).toBe(false);
expect(getRedirectPath({ user: { role: "admin" } })).toBe("/portal/dashboard");
```

Add mock-boundary coverage proving `mock-token:mock-admin` returns an admin
profile through `/users/` and can load the issuer document list, while the
participant token retains its restricted list.

- [ ] **Step 2: Run tests and confirm RED**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/portal/lib/portal-role.test.ts \
  app/login/page.test.ts \
  lib/portal-mock.test.ts
```

Expected: failures for unsupported admin portal role, `/admin/dashboard`
redirect, and rejected mock admin token.

- [ ] **Step 3: Implement the smallest actor mapping**

In `portal-role.ts`, reuse `isAdminRole`:

```ts
export function isPortalSuperAdminRole(role?: string): boolean {
  return isAdminRole(role);
}

export function getPortalUiRole(role?: string): PortalUiRole {
  const normalized = role?.trim().toLowerCase();
  if (normalized === "lawyer" || isPortalSuperAdminRole(normalized)) return "issuer";
  if (normalized === "user") return "participant";
  return "unsupported";
}
```

Return `/portal/dashboard` for every supported portal role. Extend the existing
mock-token/profile helpers with one Super Admin issuer profile; do not create a
second mock store.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run the Step 2 command. Expected: all focused tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/portal/lib/portal-role.ts \
  apps/web/app/portal/lib/portal-role.test.ts \
  apps/web/app/login/page.tsx apps/web/app/login/page.test.ts \
  apps/web/lib/portal-mock.ts apps/web/lib/portal-mock.test.ts
git commit -m "fix(web): unify issuer actor roles"
```

---

### Task 2: Add Super Admin navigation and server-side portal guards

**Files:**
- Modify: `apps/web/app/portal/lib/portal-dashboard.ts`
- Modify: `apps/web/app/portal/lib/portal-dashboard.test.ts`
- Modify: `apps/web/app/portal/components/portal-role-navigation.ts`
- Modify: `apps/web/app/portal/components/portal-role-navigation.test.ts`
- Modify: `apps/web/app/portal/layout.tsx`
- Modify: `apps/web/proxy.ts`
- Modify: `apps/web/lib/admin-access.test.ts`

**Interfaces:**
- Changes: `getPortalNavigation(role: PortalUiRole, superAdmin?: boolean)`
- Produces: `SUPER_ADMIN_PORTAL_PATHS` containing the five privileged routes
- Consumes: `isPortalSuperAdminRole(profile.role)` from Task 1

- [ ] **Step 1: Write failing navigation tests**

Assert that `getPortalNavigation("issuer", true)` contains exactly one
`Super Admin` group with:

```ts
[
  ["User Accounts", "/portal/users"],
  ["Issuer Invitations", "/portal/issuer-invitations"],
  ["System Reports", "/portal/system-reports"],
  ["Audit Logs", "/portal/audit-logs"],
  ["System Statistics", "/portal/system-statistics"],
]
```

Assert standard issuers and participants contain none of those routes.

- [ ] **Step 2: Write failing proxy authorization tests**

Cover:

```text
admin_token + portal_token -> /portal/users continues
portal_token only -> /portal/users redirects /portal/dashboard
no session -> /portal/users redirects /login
participant portal token -> /portal/system-reports redirects /portal/dashboard
normal /portal/documents remains available with portal_token
```

- [ ] **Step 3: Run tests and confirm RED**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/portal/lib/portal-dashboard.test.ts \
  app/portal/components/portal-role-navigation.test.ts \
  lib/admin-access.test.ts
```

- [ ] **Step 4: Implement conditional navigation and proxy guards**

Pass `isPortalSuperAdminRole(profile.role)` from `PortalLayout` to
`getPortalNavigation`. Add only the required icon mappings. In `proxy.ts`,
check the exact privileged portal prefixes before the general portal-token
check. `admin_token` is the authority; never authorize from `user_role`.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run the Step 3 command. Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/portal/lib/portal-dashboard.ts \
  apps/web/app/portal/lib/portal-dashboard.test.ts \
  apps/web/app/portal/components/portal-role-navigation.ts \
  apps/web/app/portal/components/portal-role-navigation.test.ts \
  apps/web/app/portal/layout.tsx apps/web/proxy.ts apps/web/lib/admin-access.test.ts
git commit -m "feat(web): expose issuer super admin navigation"
```

---

### Task 3: Move required management screens into the portal

**Files:**
- Create: `apps/web/app/portal/users/page.tsx`
- Create: `apps/web/app/portal/issuer-invitations/page.tsx`
- Create: `apps/web/app/portal/system-reports/page.tsx`
- Create: `apps/web/app/portal/audit-logs/page.tsx`
- Create: `apps/web/app/portal/lib/super-admin-pages.test.ts`
- Modify: `apps/web/app/admin/users/page.tsx`
- Modify: `apps/web/app/admin/invitations-permissions/page.tsx`
- Modify: `apps/web/app/admin/generated-reports/page.tsx`
- Modify: `apps/web/app/admin/audit-logs/page.tsx`

**Interfaces:**
- Reuses: `UsersManagementView`
- Reuses: `InvitationsManagementView`
- Reuses: `GeneratedReportsManagementView`
- Reuses: `AuditLogsManagementView`
- Legacy pages produce server redirects to the mapped portal routes

- [ ] **Step 1: Write failing route-source tests**

Add a small source/route contract test that asserts each new portal page exists
and imports the existing management view rather than defining a replacement.
Also assert each legacy page imports `redirect` and names its target portal
route.

- [ ] **Step 2: Run the contract test and confirm RED**

```bash
pnpm --filter @lexchain/web exec vitest run app/portal/lib/super-admin-pages.test.ts
```

Expected: failure because portal management pages do not exist and old pages
still render `AdminShell`.

- [ ] **Step 3: Create portal pages by reusing existing views**

Move only the small server-side loader behavior needed by each page and render
the existing view directly; the portal layout supplies the shell. Example:

```tsx
export default async function PortalSystemReportsPage() {
  return <GeneratedReportsManagementView />;
}
```

For Users, Invitations, and Audit Logs, reuse `admin-demo-data`, `adminFetch`,
and the existing response shapes. Do not add client fetches or another state
store.

- [ ] **Step 4: Replace legacy target pages with redirects**

Each old page becomes the minimal server redirect:

```tsx
import { redirect } from "next/navigation";

export default function LegacyAdminUsersPage() {
  redirect("/portal/users");
}
```

- [ ] **Step 5: Run focused view and route tests**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/portal/lib/super-admin-pages.test.ts \
  app/admin/users/users-management-view.test.tsx \
  app/admin/generated-reports/generated-reports-management-view.test.tsx
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/portal/users apps/web/app/portal/issuer-invitations \
  apps/web/app/portal/system-reports apps/web/app/portal/audit-logs \
  apps/web/app/portal/lib/super-admin-pages.test.ts \
  apps/web/app/admin/users/page.tsx \
  apps/web/app/admin/invitations-permissions/page.tsx \
  apps/web/app/admin/generated-reports/page.tsx \
  apps/web/app/admin/audit-logs/page.tsx
git commit -m "feat(web): move super admin tools into portal"
```

---

### Task 4: Retire the old dashboard and add focused system statistics

**Files:**
- Replace: `apps/web/app/admin/dashboard/page.tsx`
- Replace: `apps/web/app/admin/login/page.tsx`
- Create: `apps/web/app/portal/system-statistics/page.tsx`
- Create: `apps/web/app/portal/system-statistics/system-statistics-view.tsx`
- Create: `apps/web/app/portal/system-statistics/system-statistics-view.test.tsx`
- Modify: `apps/web/proxy.ts`
- Modify: `apps/web/lib/admin-access.test.ts`

**Interfaces:**
- Produces: compact `SystemStatisticsView` using existing dashboard response fields
- Legacy `/admin/dashboard` and `/admin/login` redirect to portal/unified login
- All other `/admin/*` page requests resolve to a target portal route or `/portal/dashboard`

- [ ] **Step 1: Write failing statistics tests**

Render `SystemStatisticsView` with a dashboard fixture and assert only target
statistics are shown:

```text
Registered Users
Document Issuers
Documents
Processed Documents
On-Chain Records
Failed Documents
Pending Invitations
```

Assert generic template panels such as `System Health` and fake trend charts do
not exist.

- [ ] **Step 2: Write failing legacy-route tests**

Assert:

```text
/admin/dashboard -> /portal/dashboard
/admin/users -> /portal/users
/admin/invitations-permissions -> /portal/issuer-invitations
/admin/generated-reports -> /portal/system-reports
/admin/audit-logs -> /portal/audit-logs
/admin/login -> /login
unmapped /admin route -> /portal/dashboard
```

- [ ] **Step 3: Run tests and confirm RED**

```bash
pnpm --filter @lexchain/web exec vitest run \
  app/portal/system-statistics/system-statistics-view.test.tsx \
  lib/admin-access.test.ts
```

- [ ] **Step 4: Implement the compact statistics page**

Reuse the existing `/api/admin/dashboard` contract and `adminStats` fixture.
Use existing `StatCard` or simple portal cards; do not migrate the old dashboard
charts, recent-activity fabrication, or system-health template.

- [ ] **Step 5: Retire legacy UI entry points**

Replace the old dashboard and admin login pages with `redirect()` calls. Add an
exact legacy-path redirect map to `proxy.ts`; preserve `/api/admin/*` routes.

- [ ] **Step 6: Run focused tests and confirm GREEN**

Run the Step 3 command. Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/admin/dashboard/page.tsx apps/web/app/admin/login/page.tsx \
  apps/web/app/portal/system-statistics apps/web/proxy.ts apps/web/lib/admin-access.test.ts
git commit -m "refactor(web): retire separate admin dashboard"
```

---

### Task 5: Correct documentation and verify the two-actor experience

**Files:**
- Modify: `docs/LEXCHAIN-WEB-TARGET-UI-UX-STATUS.md`
- Modify: `docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md`
- Create: `docs/LEXCHAIN-TWO-ACTOR-PORTAL-ACCEPTANCE.md`

**Interfaces:**
- Actor matrix contains only Document Issuer and Document Participant
- Anonymous verification is described as a feature, not a registered actor

- [ ] **Step 1: Update documentation terminology**

Replace the separate Admin section/rows with `Document Issuer — Super Admin
capabilities`. Document the new portal routes and legacy redirects. Remove any
claim that `/admin/dashboard` is an active workspace.

- [ ] **Step 2: Run actor/copy scans**

```bash
rg -n "\| Admin \||Admin workspace|Admin dashboard|third actor" \
  docs/LEXCHAIN-WEB-TARGET-UI-UX-STATUS.md \
  docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md

rg -n 'href="/admin|router\.(push|replace)\("/admin|location\.href = "/admin' \
  apps/web/app apps/web/lib
```

Expected: no active product navigation or documentation treats Admin as a
third actor. Redirect compatibility files may contain `/admin` route strings.

- [ ] **Step 3: Run complete automated verification**

```bash
pnpm --filter @lexchain/web test
pnpm --filter @lexchain/web lint
pnpm --filter @lexchain/web build
git diff --check
git diff --name-only -- apps/mobile openapi-updated.json packages/types/src/generated/schema.ts
```

Expected: all web commands pass; protected-scope diff is empty.

- [ ] **Step 4: Run role-based browser acceptance in mock mode**

Verify:

```text
Super Admin -> /portal/dashboard with Super Admin group and all five tools
Lawyer issuer -> /portal/dashboard without Super Admin group
Participant -> restricted portal without issuer/Super Admin tools
/admin/dashboard -> /portal/dashboard
/admin/users -> /portal/users for Super Admin
standard issuer/participant direct /portal/users -> safe denial/redirect
```

Record observed routes and copy in
`docs/LEXCHAIN-TWO-ACTOR-PORTAL-ACCEPTANCE.md`.

- [ ] **Step 5: Commit documentation and acceptance evidence**

```bash
git add -f docs/LEXCHAIN-WEB-TARGET-UI-UX-STATUS.md \
  docs/LEXCHAIN-BACKEND-TARGET-HANDOFF.md \
  docs/LEXCHAIN-TWO-ACTOR-PORTAL-ACCEPTANCE.md
git commit -m "docs(web): record two-actor portal readiness"
```

---

## Final review requirements

- Review each task independently before starting the next task.
- Final reviewer checks the whole branch against both updated Draw.io diagrams.
- Any access-control finding blocks completion.
- Complete only after fresh tests, lint, build, actor/copy scans, protected-scope
  check, and browser acceptance all pass.

## Explicitly skipped

- Deleting backend admin endpoints.
- Changing database roles or OpenAPI contracts.
- Migrating mobile UI.
- Rebuilding management views.
- Migrating legacy admin-template pages that have no target use case.
- Adding a new auth or permission framework.
