# LexChain architecture

LexChain is one root Next.js application for document workflows, verification and administration. It is installable as a PWA and uses a separate FastAPI backend. The former Expo application is preserved at `codex/backup-expo-before-web-pwa-2026-09-09`; it is not part of the active workspace.

## Ownership

| Location | Responsibility |
| --- | --- |
| `src/app/` | Next.js routes, layouts, metadata, API handlers, and manifest |
| `src/proxy.ts` | Request interception and session or legacy-route redirects |
| `src/features/` | Document, verification, access, office, account, authentication, admin, and portal behavior and views |
| `src/shared/components/` | Browser-safe reusable UI |
| `src/shared/api/` | Browser transport to same-origin routes and shared API helpers |
| `src/server/api/` | Server-only backend URL, credential, and request helpers |
| `src/config/` | Pure API configuration |
| `src/shared/types/` | Backend types and generated OpenAPI schema |
| `src/lib/mocks/` | Local mock fixtures and mock-mode helpers |
| `src/pwa/` | Production service-worker registration |
| `public/` | Static assets, PWA icons, service worker, and offline fallback |
| `scripts/`, `e2e/` | Contract maintenance and browser checks |

`src/app/` owns Next.js integration. `src/features/` owns domain behavior. Shared browser modules do not import features or server modules. Browser API calls go through `src/shared/api/client.ts` to same-origin route handlers; server-rendered views and server actions may use `src/server/api/backend.ts` directly. Keep server-only modules out of client bundles.

## API and type boundaries

### Feature entry points

Feature barrels use explicit named exports for symbols consumed outside their feature. Import public helpers from `@/features/<feature>`, reusable feature UI from its `components` entry point, and route views from its `pages` entry point. Admin management views have their own entry points, such as `@/features/admin/users`.

Internal modules keep direct implementation imports. Tests may also import implementations directly to exercise or mock a focused module. Keep server helpers in `server/index.ts` and server-rendered route views in `pages/server.ts`; never re-export them from a browser-safe entry point. Preserve direct lazy imports for PDF viewers and mock fixtures so barrels do not change when those modules load. The office `reports.ts` entry point keeps demo report generation separate from office settings.

Do not use `export *` or add an entry point without an outside consumer. The architecture script follows runtime imports and re-exports to prevent client modules from reaching server modules through a barrel.

Configure backend URLs with `API_URL` and `NEXT_PUBLIC_API_URL`; never hardcode credentials or backend URLs. Backend types are generated from `openapi-updated.json` into `src/shared/types/generated/schema.ts`:

```bash
pnpm generate:api-types
OPENAPI_URL='http://localhost:8000/openapi.json' pnpm refresh:api-contract
```

Review the contract diff before generation. Do not hand-edit the generated schema.

## PWA and offline behavior

`src/app/manifest.ts` describes the installable app. `src/pwa/pwa-registration.tsx` registers `public/sw.js` only in production. The worker caches only `offline.html`, serves it only after a failed eligible navigation, and never caches API responses, authenticated pages, documents, uploads, tokens or user data. There is no offline mutation queue, background sync or forced reload.

## Verification and deployment

Run from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm test:scripts
pnpm typecheck
pnpm lint
pnpm build
```

Run `node e2e/pwa.mjs` against `pnpm start` to check installation, cache behavior and offline fallback. Deployment uses root directory `.`, `pnpm install --frozen-lockfile`, and `pnpm build`. Hosting configuration, deployed CI, real backend flows and physical-device installation require separate verification.

## Rollback

Revert the specific migration commit that introduced a regression and rerun its checks. Do not restore the Expo archive wholesale. To inspect it separately:

```bash
git worktree add --detach ../LexChain-expo-archive codex/backup-expo-before-web-pwa-2026-09-09
```
