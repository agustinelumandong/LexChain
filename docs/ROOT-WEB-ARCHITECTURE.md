# Root web architecture

LexChain has one root Next.js application and a separate FastAPI backend. Next owns the browser routes, server rendering and API proxy handlers. Domain code lives under `features/`; shared transport, configuration and generated contract types live under `lib/`. The PWA adds installation and a static offline fallback to this application.

The approved [specification](superpowers/specs/2026-09-09-root-web-architecture.md) and [migration plan](superpowers/plans/2026-09-09-root-web-architecture.md) record the original migration scope. Their planning-time status and old source paths are historical. Use [README.md](../README.md) for current setup commands.

## Ownership

```text
app/                       Next routes, layouts, metadata and API handlers
features/
  documents/               Library, upload, review, lifecycle and activity
  verification/            Integrity checks and verification views
  access/                  Invitations, requests, participants and role access
  office/                  Books, categories, reports and office settings
  account/                 Profile views
  auth/                    Login, registration and password flows
  admin/                   Admin views and server rendering helpers
  portal/                  Dashboard, shell and navigation
components/                Shared UI and PWA registration
lib/
  api/client.ts            Browser transport to same-origin Next routes
  api/server.ts            Server backend requests, URL and token helpers
  api/config.ts            Pure configuration functions
  api/shared.ts            Existing shared helpers while consumed
  types/index.ts           Backend type exports
  types/generated/schema.ts Generated OpenAPI types
  mocks/                   Local fixtures and mock-mode helpers
public/                    Assets, icons, service worker and offline fallback
scripts/                   Explicit contract refresh and script tests
e2e/                       Browser checks
```

Only create populated modules. Domain files retain descriptive names where merging them would produce a large catch-all module. There is no mandatory feature barrel or generic service layer. `pnpm-workspace.yaml` retains package-manager settings without defining child workspaces.

## Request and import boundaries

Browser requests follow this path:

```text
app route → feature view/hook → feature API operation
         → same-origin app/api handler → FastAPI
```

`lib/api/client.ts` provides the existing shared browser transport where applicable. Domain wrappers retain distinct error and upload behavior. Server-rendered views and server actions use server helpers directly; they need not call their own HTTP route handlers.

- `app/` owns routing and Next exports; feature views own product behavior. Keep metadata, route configuration and valid server action boundaries intact when extracting a view.
- Features do not import route implementations. Shared `lib/` and UI do not import features or routes. Document code may explicitly consume access and verification functions/types where the workflow needs them.
- `lib/api/server.ts` and `features/*/server/**` are server-only consumers. The admin server rendering helper remains separate because it also controls redirects and caching.
- `lib/api/config.ts` receives an environment map instead of reading ambient environment state. Root setup uses `API_URL` and `NEXT_PUBLIC_API_URL`.
- Client mock-mode checks use a lightweight flag helper. Server fixtures belong in `lib/mocks/`; importing the fixture dataset into a browser view defeats that separation.
- Generated backend types remain in `lib/types/`. Feature display and form types stay with the feature. Refreshing the backend contract is separate from local generation.
- Route URLs, role mappings, cookies, endpoint methods, payloads, response/error contracts and React Query invalidation behavior must survive structural moves.

Use the root `@/` alias. The former `@lexchain/*` packages are local modules now. Native files on the archive branch and ignored local artifacts are not active application sources.

## Offline and update behavior

`app/manifest.ts` describes a standalone app starting at `/`, with scope `/` and 192/512-pixel PNG icons. `components/pwa-registration.tsx` registers `/sw.js` in production without blocking rendering if registration fails.

The worker caches only `/offline.html` under its own versioned cache name. It uses the network for eligible same-origin GET navigation and shows the fallback only when the request fails. Non-navigation requests and excluded API/file/document paths pass through. It never adds network responses, documents, tokens, user data or uploads to CacheStorage.

The fallback requires connectivity; it does not claim that verification succeeded or an upload was queued. There is no offline mutation queue, background sync or push service. Worker updates wait for old tabs to close, and activation removes only obsolete caches with this worker's prefix.

## Verification and deployment

Run `pnpm test`, `pnpm test:scripts`, `pnpm typecheck`, `pnpm lint` and `pnpm build` from the root after a frozen install. Vitest includes `app/`, `features/`, `components/` and `lib/`. Route integration tests stay at route boundaries; tests of extracted behavior follow the feature implementation. Source-reading tests must inspect the implementation, not an empty route shell.

Run `node e2e/pwa.mjs` against a production server for the manifest, offline fallback and cache checks. The legacy full-flow script requires a test backend and environment-provided credentials because it uploads documents and changes access. Keep mock checks separate from real integration results.

Hosting must use root directory `.`, `pnpm install --frozen-lockfile`, `pnpm build` and the root environment settings. The repository's web-checks workflow runs application tests, script tests, lint, typecheck and build. Updating these files does not change a hosting dashboard or prove a deployed workflow passed.

The [migration baseline](root-web-migration-baseline.md) records the starting failures separately from migration verification. Real backend authentication/document flows, deployed CI, hosting root configuration, two-tab updates and physical Android/iOS installation need direct evidence before they are marked verified. They are not claimed verified by this guide.

## Archive and rollback

`codex/backup-expo-before-web-pwa-2026-09-09` preserves the former native application at `1d3852c74c5162d1cb30f5aa5782acafe7e17b57`. Leave this archive unchanged.

Revert the specific migration commit that introduced a regression, then rerun its relevant checks. Do not reset shared history or restore the archived tree wholesale onto the active branch. To inspect the old application separately:

```bash
git worktree add --detach ../LexChain-expo-archive codex/backup-expo-before-web-pwa-2026-09-09
```

Any deployment rollback also requires checking the host's root-directory and environment settings against the selected revision.
