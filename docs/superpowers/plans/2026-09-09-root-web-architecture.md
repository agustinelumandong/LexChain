# Root Web/PWA Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This document is planning only: do not execute until explicitly requested.

**Goal:** Turn LexChain into one root Next.js/PWA app and organize its existing UI, API clients and types by responsibility without breaking the working product.

**Architecture:** Relocate the web application and internal packages in one independently verifiable migration, then reorganize domains in separate commits. Preserve Next route URLs and distinguish browser transport from server backend access. PWA delivery follows the structural migration as a separately testable feature.

**Tech Stack:** Next.js 16.2.6, React 19.2.4, TypeScript, pnpm 11.13.0, existing TanStack Query, Vitest, Testing Library and Playwright.

**Spec:** `docs/superpowers/specs/2026-09-09-root-web-architecture.md`. This replaces the earlier plan that retained `apps/web` and workspace packages.

## Global Constraints

- Plan only in the current turn; no migration, deletion, install, branch change or application implementation now.
- Preserve the backup branch `codex/backup-expo-before-web-pwa-2026-09-09`; recorded commit `1d3852c74c5162d1cb30f5aa5782acafe7e17b57`.
- Root-level `app/`, `features/`, `components/`, `lib/`, `public/`. No active `apps/` or `packages/` in the final tracked tree.
- pnpm only; preserve package versions and lightningcss `1.30.1`. Do not conflate architecture migration with dependency upgrades.
- No new runtime library for folder organization. No generic repository/service class framework.
- Preserve backend contracts, cookie names, route URLs, role behavior and mock mode during relocation.
- No generated-schema hand edits. No secrets or ignored environment files in commits.
- Root `.gitignore` ignores Markdown. During execution add narrow exceptions for the spec, this plan and active setup/architecture docs, not a blanket unignore of every Markdown file.

## Evidence and execution prerequisites

Read-only inspection found existing portal lifecycle/extraction/integrity/access clients, server utilities named `admin-api.ts`, shared generated types, and React Query calls in pages. `apps/web/vitest.config.ts` only includes app/lib tests. Several tests read source paths directly. `.github/workflows/react-doctor.yml` uses stale `frontend` paths. Root and web config/document files collide during relocation. There is no identified web manifest or service-worker setup in the inspected sources. Runtime checks have not been performed for this plan.

Before code changes, read current root/web AGENTS instructions and the installed Next documentation for project structure, server/client boundaries, manifest and PWA behavior. The attempted `apps/web/node_modules/next/dist/docs` lookup was unavailable during planning; resolve the installed package path first, or use official Next documentation if absent. Verify supported Node/pnpm versions before writing CI. Do not assume the old CI Node 20 setting supports pnpm 11.

## Task 1: Record baseline and protect recovery

**Files:** Create `docs/root-web-migration-baseline.md`; no source changes.
**Consumes:** Existing checkout and published archive. **Produces:** Base commit, route/test inventories and baseline check results.

- [ ] Verify a clean working tree and the archive before creating `codex/root-web-architecture` from the then-current approved dev state:
```bash
git status --short
git rev-parse HEAD
git ls-remote origin refs/heads/codex/backup-expo-before-web-pwa-2026-09-09
git show codex/backup-expo-before-web-pwa-2026-09-09:apps/mobile/package.json
git switch -c codex/root-web-architecture
```
If dev has advanced, record that new base separately; do not overwrite the archive. If uncommitted work exists, preserve it and isolate execution rather than resetting it.
- [ ] Run the current baseline and record exit codes and failing test names:
```bash
pnpm install --frozen-lockfile
pnpm --filter @lexchain/web test
pnpm --filter @lexchain/web lint
pnpm --filter @lexchain/web exec tsc --noEmit
pnpm --filter @lexchain/web build
```
- [ ] Capture tracked route/test inventory and ignored-file names (never print environment contents):
```bash
git ls-files 'apps/web/app/**/page.tsx' 'apps/web/app/**/route.ts' 'apps/web/**/*.test.ts' 'apps/web/**/*.test.tsx'
git ls-files --others --ignored --exclude-standard apps/web
```
- [ ] Record API consumer -> helper -> Next route -> upstream method/path, cookie, response type and mock/test coverage for each domain using graph discovery. Existing route tests are the behavior baseline; fix baseline blockers separately before migration.

**Gate:** Archive matches its recorded commit; baseline results and test inventory are recorded. Do not count unknown or pre-existing failures as a passing baseline.

## Task 2: Relocate to one root application

**Files:** Move tracked `apps/web/app`, `components`, `lib`, `public`, `e2e`, `proxy.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `tsconfig.json` to root. Merge `package.json`, `.gitignore`, `.env.example`, `AGENTS.md`, README and docs by responsibility. Move packages as mapped below. Remove tracked mobile files and EAS workflow after archive verification.

**Interfaces:** Preserve `@/* -> ./*`; replace `@lexchain/types` with `@/lib/types`, `@lexchain/types/openapi` with `@/lib/types/generated/schema`, `@lexchain/config` with `@/lib/api/config`, and `@lexchain/api` with `@/lib/api/shared`.

| Source | Destination |
|---|---|
| `packages/types/src/index.ts` | `lib/types/index.ts` |
| `packages/types/src/generated/schema.ts` | `lib/types/generated/schema.ts` |
| `packages/config/src/index.ts` | `lib/api/config.ts` |
| `packages/api/src/index.ts` | `lib/api/shared.ts` |

- [ ] Compare destination paths before moving. Never execute a blanket `mv apps/web/* .`: it misses dotfiles and collides with root files.
- [ ] Move only the explicitly listed tracked source/config directories. Preserve ignored `.env`, design artifacts and local notes; migrate environment values locally only after comparing variable names. Do not move `node_modules`, `.next`, caches or tsbuildinfo. Classify remaining tracked web files individually as source, docs, design or obsolete sample; preserve unexplained artifacts.
- [ ] Use web package dependencies as the root dependencies. Delete only the three workspace dependency entries; add the currently locked `openapi-typescript` dev dependency. Preserve root packageManager. Root scripts:
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "generate:api-types": "openapi-typescript openapi-updated.json -o lib/types/generated/schema.ts"
}
```
- [ ] Relocate package sources byte-for-byte, then update import specifiers (replace `/openapi` before the base types name). Remove Next `transpilePackages`. Keep pure config exports and existing EXPO fallback temporarily so relocation does not change deployed configuration behavior.
- [ ] Remove `packages` workspace manifests and mobile tracked sources once references are converted. Remove the `packages:` workspace glob list. Keep `pnpm-workspace.yaml` as pnpm settings only, preserving `overrides`, `allowBuilds` and `ignoredBuiltDependencies`; it must define no child workspaces. This file's name does not require retaining a monorepo.
- [ ] Update Vitest discovery BEFORE moving feature tests:
```ts
include: [
  'app/**/*.test.{ts,tsx}',
  'features/**/*.test.{ts,tsx}',
  'components/**/*.test.{ts,tsx}',
  'lib/**/*.test.{ts,tsx}',
]
```
Preserve the Node default and individual jsdom annotations. Ensure root TypeScript does not scan ignored local worktrees/generated experiments; use scoped includes for app/features/components/lib/configs as necessary instead of compiling every local file.
- [ ] Run `pnpm install` to regenerate the lockfile, then `pnpm install --frozen-lockfile`. Confirm all original tests are still discovered, allowing renamed paths but no lost cases.
- [ ] Verify root operation:
```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```
**Gate/commit:** `refactor: move web application to repository root`. No UI behavior or domain extraction in this commit. Review staged diff and `git diff --cached --check` before committing during execution.

## Task 3: Root CI, deployment and documentation

**Files:** `.github/workflows/react-doctor.yml`, new `.github/workflows/web-checks.yml`, `.gitignore`, root `AGENTS.md`, README, `.env.example`, active deployment configs found in the tracked inventory.
**Produces:** Root commands that work in CI and documented deployment root `.`.

- [ ] Remove EAS workflow if not removed in Task 2. Fix React Doctor working directory to `.` and cache hash to `pnpm-lock.yaml`; align pnpm with packageManager.
- [ ] Add a web-checks job on pull requests and main/dev pushes, using pnpm/action-setup reading packageManager and a Node version verified to support that pnpm version. Run frozen install, test, lint, typecheck and build as separate failing steps. Do not mask failures with `|| true`.
- [ ] Update deployment build/install commands to root commands. Document any hosting-dashboard root-directory change requiring operator access; repository edits cannot prove an external setting changed.
- [ ] Merge relevant web rules into root AGENTS and replace stale Expo/workspace commands. Keep archive recovery instructions. Document root environment variable names without values.
- [ ] Add narrow Markdown ignore exceptions for these active docs and both new planning files; confirm they are trackable with `git check-ignore` before staging.
- [ ] Validate the same root checks and inspect workflow paths. Commit `chore: align automation and docs with root web app`.

## Task 4: Establish transport and type boundaries by moving existing code

**Files:** Move `lib/admin-api.ts -> lib/api/server.ts`, `app/portal/lib/portal-fetch.ts -> lib/api/client.ts`, `lib/portal-mock.ts -> lib/mocks/portal.ts`; update every importer and mock target. Keep existing shared API helpers only while consumed.
**Interfaces:** Keep `backendUrl`, server `adminFetch`, `missingApiUrl`, `missingToken`, `getTokenFromRequest`, and `portalFetch<T>(path: string): Promise<T>` unchanged. `app/admin/components/admin-fetch.ts` is a DIFFERENT server-rendering helper with redirects/cache behavior; move it to `features/admin/server/fetch.ts`, not browser transport.

- [ ] Trace all consumers of these functions and inspect imports, including tests with `vi.mock` strings.
- [ ] Move code without consolidating different fetch behavior. Use names/location and lint boundaries to keep `lib/api/server.ts` and `features/*/server/**` out of client graphs. Do not add a package solely for a boundary marker.
- [ ] Keep generated backend types at `lib/types`; feature UI types remain feature-owned. Preserve generated file bytes and exported aliases.
- [ ] Run route auth/proxy tests, extraction/lifecycle/integrity tests and the full root checks. Commit `refactor: separate browser and server API modules`.

**Deliberate scope:** Request implementations currently have different error/cache semantics. Keep those differences until characterization tests justify consolidation; organization does not require one universal fetch wrapper.

## Task 5: Move domain modules and colocated tests

**Files:** Apply this mapping to `app/portal/lib/`, including matching tests. Filename stems below refer to both `.ts` and `.test.ts` where present.

| Stems | Destination directory |
|---|---|
| `document-lifecycle-api`, `document-lifecycle-ui`, `document-library`, `document-ui`, `document-activity-access`, `activity-log`, `extraction-api`, `portal-upload` | `features/documents/` |
| `integrity-api`, `integrity-ui` | `features/verification/` |
| `portal-access-api`, `portal-access`, `participant-access`, `request-ui`, `portal-role`, `issuer-page-access` | `features/access/` |
| `category-management`, `office-insight`, `office-settings-schema` | `features/office/` |
| `portal-dashboard` | `features/portal/` |

Cross-page/source audit tests (`portal-ui-audit`, `issuer-management-pages`, `issuer-management-mock-mode`) stay as integration tests under `app/portal/` with updated paths, rather than belonging to a single domain.

**Interfaces:** Keep existing function/type export names. Public domain imports use `@/features/<domain>/<module>`. No feature imports a route implementation.

- [ ] Move documents and associated tests first; repair internal relative imports and route consumers. Move verification, access, office and portal in separate reviewable batches.
- [ ] Update all `vi.mock` module paths alongside imports. For source-reading tests, follow the implementation to its new path; do not leave an audit scanning an empty wrapper or remove the assertion to make it pass.
- [ ] Run domain tests after each batch and all tests/typecheck before each commit. Compare test counts with baseline.
- [ ] Commit each domain separately, e.g. `refactor: organize document domain modules`.

## Task 6: Extract feature views and endpoint ownership

**Files:** Non-route portal/document/admin view components and page implementations; existing route tests stay at route boundaries. Move view-specific tests with views.

| Current root source | Target |
|---|---|
| `app/portal/documents/[id]/document-workspace.tsx` | `features/documents/components/document-workspace.tsx` |
| `app/portal/documents/[id]/review/review-workspace.tsx` | `features/documents/components/review-workspace.tsx` |
| `app/portal/documents/[id]/review/pdf-document-viewer.tsx` | `features/documents/components/pdf-document-viewer.tsx` |
| `app/portal/documents/[id]/verify/verify-workspace.tsx` | `features/verification/components/verify-workspace.tsx` |
| `app/portal/components/integrity-result.tsx` | `features/verification/components/integrity-result.tsx` |
| `app/portal/components/participant-access-table.tsx`, `invite-participant-form.tsx` | `features/access/components/` |
| Remaining portal shell/navigation components | `features/portal/components/` |
| Admin non-route management views/tables/components | `features/admin/` preserving domain subfolders |

- [ ] Extract populated page views to the matching domain: document list/detail/review/upload -> documents; verification -> verification; invitations/requests -> access; books/categories/reports/office-settings -> office; profile -> account; login/register/password flows -> auth; dashboard/navigation -> portal; admin pages -> admin. Keep standalone legal/marketing pages colocated unless they contain reusable product behavior.
- [ ] Preserve `'use client'` at the extracted client module and retain Next-specific exports (`metadata`, `generateMetadata`, route config, server actions) at their valid boundary. Typical route after extraction:
```tsx
import { DocumentsPage } from '@/features/documents/pages/documents-page';
export default DocumentsPage;
```
Use this only when the original page has no additional route exports/logic; otherwise preserve those exports and render the view explicitly. Server actions keep their server directive; do not turn them into client utilities.
- [ ] Move inline request functions into the corresponding feature's API module, preserving exact URLs, methods, body encoding and response/error behavior from the baseline inventory. Retain domain-specific files when one `api.ts` would become large.
- [ ] Move existing query logic to feature hooks only where it separates nontrivial data behavior from rendering; retain query keys, enabled conditions, retries and invalidation. No new state library or global endpoint registry.
- [ ] Extend existing API tests BEFORE changing request code. For extraction, retain this concrete regression:
```ts
it('preserves authentication status for the caller', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
    Response.json({ message: 'Not authenticated' }, { status: 401 }),
  ));
  await expect(getExtractionReview('doc-1')).rejects.toMatchObject({
    status: 401, message: 'Not authenticated',
  });
});
```
Use the existing extraction suite cleanup. Keep current successful GET/PATCH/POST assertions and FormData upload coverage. No endpoint may disappear from the inventory.
- [ ] Keep small duplicated request wrappers if they encode different error contracts. Consolidate only a proven identical operation in a separate commit with its characterization tests.
- [ ] Run each affected domain/route suite, root typecheck and build, then full tests/lint. Commit by domain; keep navigation/role checks and PDF/upload checks passing.

## Task 7: Make type generation independent of remote refresh

**Files:** Root `package.json`, `scripts/fetch-openapi.mjs`; generated schema remains unchanged unless explicitly refreshing the contract.
**Interfaces:** `pnpm generate:api-types` generates locally; `OPENAPI_URL=... pnpm refresh:api-contract` explicitly refreshes the contract.

- [ ] Keep local generation from Task 2. Set `refresh:api-contract` to `node scripts/fetch-openapi.mjs`; refresh must not implicitly regenerate or swallow errors.
- [ ] Replace the hardcoded URL with required `process.env.OPENAPI_URL`. Fetch and parse before writing, require an object with `openapi` and `paths`, write a temporary sibling file, then rename it over `openapi-updated.json`. Invalid URL, failed HTTP or invalid JSON exits nonzero with the original file untouched. Never log credentials embedded in the URL.
- [ ] Add a small Node test using a local HTTP server to return 500 and invalid JSON; run the refresh script in an isolated temporary directory and assert its fixture contract remains byte-identical. For successful JSON assert valid replacement. Use built-in `node:test`; make script output path injectable for the isolated test, defaulting to the repository contract.
- [ ] Run generation twice and compare generated output after each run; expected no diff on the second run. Review any first-run diff rather than accepting contract drift as relocation.
- [ ] Audit environment-name usage before removing EXPO fallback. Remove it only once local/deployment configuration uses API_URL or NEXT_PUBLIC_API_URL, as a separately tested config change.
- [ ] Commit `chore: separate contract refresh from local type generation`.

## Task 8: PWA installation and safe offline fallback

**Files:** New `app/manifest.ts`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/offline.html`, `public/sw.js`, `components/pwa-registration.tsx`; modify `app/layout.tsx`. Use existing logo as icon source; verify square sizing and actual rendered assets. No push backend.

- [ ] Confirm deployed PWA behavior and read matching Next docs before implementation. Use a manifest with name `LexChain`, short_name `LexChain`, start_url `/`, scope `/`, display `standalone`, theme/background colors matching existing branding and the two PNG icons.
- [ ] Add manifest regression coverage in `app/manifest.test.ts`:
```ts
import { expect, it } from 'vitest';
import manifest from './manifest';
it('launches the root app with install icons', () => {
  expect(manifest()).toMatchObject({ name: 'LexChain', start_url: '/', scope: '/', display: 'standalone' });
  expect(manifest().icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: '192x192', type: 'image/png' }),
    expect.objectContaining({ sizes: '512x512', type: 'image/png' }),
  ]));
});
```
- [ ] Implement only a static offline fallback cache. Precache `/offline.html` in a versioned cache; intercept same-origin navigation requests with network-first fallback only on network failure. Never put navigation responses, `/api/`, PDFs, uploads, tokens or user data into CacheStorage. Non-navigation requests pass through untouched.
- [ ] Register `/sw.js` from a client effect mounted in the root layout only in production. Registration failure must not block app rendering. Do not force `skipWaiting`/reload while documents may be edited; activate updates after old tabs close and remove only this worker's obsolete cache names.
- [ ] Offline page says connection is required and provides a retry link; it must not display successful verification or queued uploads.
- [ ] Extend `e2e/full-flow.mjs` or add `e2e/pwa.mjs` using the existing Playwright package: serve production build, confirm worker installation, navigate offline and assert fallback text, inspect cache keys and assert only offline HTML is stored, restore network and verify normal navigation. Keep real-device installation as a separate manual check for iOS/Android.
- [ ] Validate login/logout, expired session, upload and review with connectivity; check update behavior with two open tabs. Record real backend versus mock checks separately. Commit `feat: add installable web app and safe offline fallback`.

## Task 9: Architecture acceptance and handoff

**Files:** Active architecture/setup docs; existing regression suites; no unrelated cleanup.

- [ ] Check tracked source has no `apps/web`, `apps/mobile`, `workspace:*`, `@lexchain/` imports or feature imports from routes. Historical docs and archive references are intentional exceptions. Do not search generated caches and mistake them for source.
- [ ] Verify root commands from a fresh dependency install, all baseline route URLs, all original test cases and new PWA checks. Include registration/login/reset, issuer/participant/admin navigation, upload, review, verification and logout.
- [ ] Inspect `e2e/full-flow.mjs` for fixture/server assumptions before running it; use a test backend/account for mutations. Do not call mock success an integration pass.
- [ ] Record external deployment root status and any missing backend/device verification explicitly. Do not claim those gates pass without evidence.
- [ ] Review each final diff for unintended content changes/secrets; commit documentation with `git diff --cached --check` passing.

**Done means:** Root app and standard root commands work; no active native/workspace app remains; domain modules own product behavior; server secrets cannot enter client imports; tests follow moved code; PWA checks and deployment setup are documented. Recover regressions by reverting the relevant commit, leaving the archive untouched.

## Plan self-review

The plan covers the explicitly requested root application, removal of active Expo, package consolidation, feature ownership, API/type boundaries, configuration/CI collisions, preserved tests, PWA behavior and rollback. Structural changes precede behavior changes. All execution steps remain unchecked. No application code, dependency installation, migration branch or runtime verification was performed while writing this plan.
