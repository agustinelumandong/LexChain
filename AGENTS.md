# LexChain — Agent Instructions

LexChain is one root Next.js application for document workflows, verification and administration, with an installable PWA and a separate Python/FastAPI backend. Start with [README.md](README.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The Expo application is preserved only on the backup branch.

## Working rules

- Plan nontrivial work and delegate independent, bounded tasks when useful. Preserve concurrent edits and ignored local files.
- Trace the full affected flow and its callers before editing. Reuse existing functions, types and UI before adding code or dependencies.
- Keep changes small and readable. No empty feature scaffolding, mandatory barrels, one-use abstractions or unrelated cleanup.
- Add or update a focused regression test for behavior changes. Moving a test must preserve its assertions and discovery; source-reading tests must follow the moved implementation.
- Use TypeScript with strict mode. Keep secrets and generated output out of handwritten source changes.
- Review diffs for correctness and sensitive data, then run the relevant project checks before finishing. Report failed or unperformed checks separately from passing results.
- Preserve route URLs, role mappings, cookies, upload encoding, request methods, error contracts, redirects and cache behavior unless changing them is explicitly part of the task.

## Code discovery

Prefer the codebase-memory-mcp knowledge graph for code discovery:

1. `search_graph` to locate functions, classes, routes and variables.
2. `trace_path` to inspect callers and dependencies.
3. `get_code_snippet` to read specific source.
4. `query_graph` for complex relationships.
5. `get_architecture` for a high-level summary.

Use `rg` for string literals, error messages, configuration and non-code files, or when graph tools are unavailable, stale or insufficient. Never treat a pre-migration graph path as proof that the file still exists.

## Current layout and ownership

| Location | Responsibility |
| --- | --- |
| `app/` | Next route entry points, layouts, metadata, API handlers and route integration tests |
| `features/documents/` | Library, upload, review, lifecycle and document activity |
| `features/verification/` | Integrity results and document verification views |
| `features/access/` | Invitations, requests, participants and portal role access |
| `features/office/` | Books, categories, reports and office settings |
| `features/account/`, `features/auth/` | Profile and authentication views |
| `features/admin/` | Admin views and server rendering helpers |
| `features/portal/` | Dashboard and portal shell/navigation |
| `components/` | Shared UI and PWA registration |
| `lib/api/client.ts` | Browser transport to same-origin Next routes |
| `lib/api/server.ts` | Server backend URL, token and request helpers |
| `lib/api/config.ts` | Pure configuration functions receiving an environment map |
| `lib/api/shared.ts` | Existing shared helpers while consumed |
| `lib/types/` | Public backend type exports and generated schema |
| `lib/mocks/` | Local mock data and mock-mode helpers |
| `public/` | Static assets, PWA icons, service worker and offline fallback |
| `scripts/`, `e2e/` | Contract maintenance and browser checks |

## Next.js and dependency boundaries

- Before Next.js implementation, read the relevant installed documentation under `node_modules/next/dist/docs/`; resolve the installed package location if needed. Use official Next.js documentation when local docs are absent.
- Use the App Router and server components by default. Preserve `"use client"`, `"use server"` and Next-specific route exports at their valid boundaries.
- Route UI composes feature views; feature modules must not import route implementations from `app/`.
- Shared `lib/` and shared UI must not import feature or route implementations. Domain-to-domain imports must be explicit and limited to the functions/types needed.
- Client API operations call same-origin Next route handlers. Server-rendered views and server actions may call server helpers directly.
- Never import `lib/api/server.ts` or `features/*/server/**` into client modules. Keep mock fixtures out of client bundles; browser mock checks should import only the lightweight flag helper.
- Keep backend/generated types in `lib/types/` and UI-specific types with their feature. Do not hand-edit `lib/types/generated/schema.ts`.
- Preserve existing React Query keys, enabled conditions and invalidation. Extract hooks only where they separate substantive data behavior from rendering.
- Use the root `@/` alias. There are no active `apps/`, `packages/` or `@lexchain/*` workspace imports.
- Never import `.agents/`, `.agent/` or local design/tooling artifacts into runtime code.

## Security and offline behavior

- Treat backend authorization as authoritative; client access checks are only UI behavior. Validate inputs at route boundaries before forwarding them.
- Keep credentials, tokens and private keys on the server. Never hardcode backend URLs; configure them through the environment.
- PWA CacheStorage contains only the static offline fallback. Do not cache API responses, authenticated navigation responses, PDFs, uploads, tokens or user data.
- Do not add offline mutation queues, background sync or forced worker activation/reloads during document work.
- Keep service-worker registration production-only and nonblocking. Remove only obsolete caches owned by this worker.

## Tooling and checks

Use Node **24.12.0 or newer** and **pnpm 11.13.0**, as declared in `package.json`. Use pnpm only. `pnpm-workspace.yaml` contains package-manager settings, not child workspaces; retain its `lightningcss: 1.30.1` override unless a separate change is approved.

Run commands from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm test:scripts
pnpm typecheck
pnpm lint
pnpm build
```

Vitest discovers tests under `app/`, `features/`, `components/` and `lib/`. Script tests use Node's built-in test runner. Use `pnpm start` to serve a production build; the PWA browser check is `node e2e/pwa.mjs` against that server.

`pnpm generate:api-types` uses the checked-in `openapi-updated.json` without a network refresh. Refresh explicitly with `OPENAPI_URL='http://localhost:8000/openapi.json' pnpm refresh:api-contract`, review the contract diff, then regenerate types. See README for setup and test-backend requirements.

## Archive and handoff

The published archive `codex/backup-expo-before-web-pwa-2026-09-09` preserves Expo at `1d3852c74c5162d1cb30f5aa5782acafe7e17b57`. Do not modify the archive or restore it wholesale onto the active branch. Revert the relevant migration commit for rollback; inspect the archive in a separate worktree if needed.

Deployment uses repository root `.`. A passing local build does not verify hosting-dashboard settings, deployed CI, real backend flows or installation on physical Android/iOS devices. Record those checks explicitly when performed.
