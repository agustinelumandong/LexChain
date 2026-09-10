# Root Web/PWA Architecture Specification

Status: approved direction from the conversation; implementation has not started.

## Product and scope
LexChain becomes one root-level Next.js application. There must be no active `apps/web`, Expo workspace, or internal workspace packages at completion. The published branch `codex/backup-expo-before-web-pwa-2026-09-09` preserves the native code. Do not modify that branch.

The migration includes folder organization, API ownership, generated TypeScript contract relocation, root tooling, CI, setup documentation and PWA delivery. It does not redesign the backend or change document workflows, roles, cookies, endpoint methods, payloads or authorization policies as a side effect of moving files.

## Target
```text
LexChain/
  app/                       # Next route entry points, layouts, API handlers
  features/                  # Domain UI, API operations, hooks, UI types
    documents/
    verification/
    access/
    office/
    account/
    admin/
    portal/                  # Portal shell/navigation composition
    auth/
  components/ui/             # Existing reusable UI primitives
  lib/
    api/client.ts            # Existing portal browser transport
    api/server.ts            # Backend URL/token utilities, server-only consumers
    api/config.ts            # Pure URL/config helpers; no ambient env reads
    api/shared.ts            # Existing shared API helpers, retained only if used
    types/index.ts
    types/generated/schema.ts
    mocks/portal.ts
  public/
  scripts/
  e2e/
  docs/
  package.json
  pnpm-lock.yaml
  next.config.ts
  tsconfig.json
```
Create only populated directories. Domain modules can retain descriptive filenames instead of becoming large `api.ts` or `types.ts` files. No mandatory index barrels and no empty architecture scaffolding.

## Dependency rules
- Route UI imports feature modules and shared UI. Route-specific Next exports stay in `app/`.
- Feature client hooks call feature API functions, which call same-origin Next routes. Backend credentials stay on the server.
- Server-rendered pages and server actions may call server helpers directly; do not make them call their own HTTP API routes.
- Features never import route implementations from `app/`. `lib/` and shared UI never import features or routes.
- Domain-to-domain dependencies are explicit: document workflows may consume access and verification public functions/types. Shared transport does not import domain types.
- Existing server/client directives, cache settings, redirects, errors, uploads and cookies survive relocation unchanged.
- Generated schemas remain generated; move them byte-for-byte before separately changing generation tooling.
- Preserve React Query keys and invalidation behavior. Extract hooks where server-state code already exists; do not add a hook for each trivial function.

## PWA scope
Installable application using the same web routes, with connectivity required for authenticated document work. Provide a non-sensitive offline fallback. No offline mutation queue, push notifications or background synchronization. Never persist API responses, documents or credentials in service-worker caches. New app versions must not force reload during uploads or editing.

## Verification and rollback
Use the existing Vitest and Playwright tools. Every migration commit must keep test discovery intact and preserve route behavior. Run test, lint, typecheck and production build at each major boundary. Mock checks and real backend checks must be reported separately. Revert individual migration commits for rollback; never reset shared history or restore the archive wholesale onto dev.
