# PROJECT KNOWLEDGE BASE — LexChain

**Generated:** 2026-05-19
**Commit:** 5714b5e
**Branch:** lexchain-web/dev
**Monorepo:** pnpm workspaces | 2 apps + 3 packages

## OVERVIEW

LexChain is a document verification platform with ECC cryptography. Monorepo with Expo mobile app, Next.js web app, and shared packages for types/API/config. Backend: Python/FastAPI (contract at `openapi-updated.json`).

## STRUCTURE

```
LexChain/
├── .agents/              # Root agent support docs/config
├── .claude/              # Claude-side plans and notes
├── .codex/               # Codex-side workspace config
├── apps/
│   ├── mobile/           # Expo RN app (React Native 0.81, SDK 54) — see apps/mobile/AGENTS.md
│   │   ├── app/          # Expo Router routes: auth, tabs, document, profile, upload/camera, verify
│   │   ├── src/          # features, services, shared components/hooks/theme/utils, tw, types
│   │   ├── assets/       # Mobile images/icons
│   │   ├── docs/         # Mobile integration notes, TODOs, Expo LLM docs
│   │   ├── android/      # Native Android project
│   │   ├── ios/          # Native iOS project
│   │   ├── scripts/      # Mobile helper scripts
│   │   ├── graphify-out/ # Local graphify cache/chunks
│   │   ├── dist*/        # Generated local build/check output; do not treat as source
│   │   ├── app.json      # Expo app config
│   │   ├── eas.json      # EAS build config
│   │   └── package.json  # @lexchain/mobile scripts/dependencies
│   └── web/              # Next.js 16 app — see apps/web/AGENTS.md
│       ├── app/          # App Router: landing, admin, verifier, invite, download, terms/privacy, API routes
│       ├── lib/          # Web API helpers and schemas
│       ├── public/       # Static web assets, including public/lexchain brand assets
│       ├── proxy.ts      # Next proxy/middleware entrypoint
│       ├── next.config.ts
│       └── package.json  # @lexchain/web scripts/dependencies
├── packages/
│   ├── types/            # @lexchain/types — src/index.ts exports generated/shared types
│   ├── api/              # @lexchain/api — src/index.ts shared API utilities
│   └── config/           # @lexchain/config — src/index.ts shared configuration
├── docs/                 # System docs: architecture, workflow, audit reports
├── todo-with-web.md      # Root planning/TODO note for web work
├── openapi-updated.json  # Backend API contract (OpenAPI 3.x)
├── pnpm-workspace.yaml   # Workspace definition
├── pnpm-lock.yaml        # pnpm lockfile
└── package.json          # Root scripts: pnpm -r, filter commands
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Mobile app guidance | `apps/mobile/AGENTS.md` | 925 lines — Expo conventions, anti-patterns, god nodes |
| Web app guidance | `apps/web/AGENTS.md` | Next.js 16 routes, API handlers, env |
| Type generation | `packages/types/` | `pnpm run generate:api-types` → `openapi-typescript` |
| Root API contract | `openapi-updated.json` | Backend OpenAPI 3.x contract used by shared types |
| System architecture | `docs/LEXCHAIN-SYSTEM-UNDERSTANDING.md` | High-level system doc |
| Workflow docs | `docs/LEXCHAIN-SYSTEM-WORKFLOW.md`, `docs/LEXCHAIN-WORKFLOW-FLOWCHARTS.md` | Process flows |
| Mobile audit | `docs/LEXCHAIN-MOBILE-MAINTAINABILITY-AUDIT.md` | Code quality report |
| Web admin pages | `apps/web/app/admin/` | Dashboard, users, invitations/permissions, logs, categories, settings |
| Web API handlers | `apps/web/app/api/` | Route handlers for admin/public proxying |
| Web helpers | `apps/web/lib/` | Admin/public verifier API helpers and schemas |
| Mobile feature code | `apps/mobile/src/features/` | Auth, dashboard, document, documents, onboarding, profile, upload, verification |
| Mobile API/query layer | `apps/mobile/src/services/` | API modules, mocks, React Query hooks, query keys |
| Mobile shared layer | `apps/mobile/src/shared/` | UI primitives, hooks, providers, config, theme, utils |
| Mobile native projects | `apps/mobile/android/`, `apps/mobile/ios/` | Generated/native project files; change only when native config requires it |

## CROSS-APP BOUNDARIES

| Responsibility | Owner | Notes |
|----------------|-------|-------|
| Public document verifier (browser) | `apps/web/app/verify/` | Next.js owns this route |
| Public verification API proxy | `apps/web/app/api/public/verify/` | Next.js route handler proxies browser upload/verify work |
| Admin panel | `apps/web/app/admin/` | Next.js only — mobile must NOT import admin screens |
| Admin API proxy/routes | `apps/web/app/api/admin/` | Next.js route handlers for admin backend calls |
| Invite/download/legal pages | `apps/web/app/invite/`, `apps/web/app/download/`, `apps/web/app/terms/`, `apps/web/app/privacy/` | Next.js owns browser fallback/support pages |
| Landing/marketing page | `apps/web/app/page.tsx` | Next.js owns |
| Mobile-native upload/camera | `apps/mobile/app/upload.tsx`, `camera-capture.tsx` | Expo owns |
| Mobile-native document detail | `apps/mobile/app/document/[id].tsx` | Expo owns |
| Mobile-native profile/account screens | `apps/mobile/app/profile/`, `apps/mobile/src/features/profile/` | Expo owns |
| Mobile-native document verification | `apps/mobile/app/verify/[id].tsx`, `apps/mobile/src/features/verification/` | Expo owns internal/native verification |
| Shared types | `packages/types/` | Generated from `openapi-updated.json` |
| Shared API client | `packages/api/` | Used by both apps |
| Shared config | `packages/config/` | Used by workspace packages/apps |

## CONVENTIONS

- **Package manager**: `pnpm` only. Root `package.json` has `packageManager: "pnpm@10.33.0"`.
- **Workspace protocol**: `pnpm --filter <name> <cmd>` or `pnpm -r <cmd>`.
- **Type generation**: `pnpm run generate:api-types` runs `openapi-typescript` on `openapi-updated.json`.
- **Transpilation**: Next.js config transpiles `@lexchain/api`, `@lexchain/config`, `@lexchain/types` (ESM packages).
- **lightningcss**: Pinned to `1.30.1` in root `pnpm.overrides` — do NOT drift.

## ANTI-PATTERNS

- **Do NOT** import `.agents/` or `.agent/` files into runtime code (mobile app rule).
- **Do NOT** reintroduce Expo web-only routes for admin/public verifier — Next.js owns these.
- **Do NOT** modify lockfiles with npm/yarn — pnpm only.
- **Do NOT** change `lightningcss` version without explicit approval — breaks NativeWind.

## COMMANDS

```bash
# Root-level
pnpm install                    # Install all workspaces
pnpm -r lint                    # Lint all workspaces
pnpm run mobile                 # Start mobile dev server
pnpm run web                    # Start web dev server
pnpm run web:build              # Build web for production
pnpm run generate:api-types     # Regenerate types from OpenAPI spec

# Per-workspace
pnpm --filter @lexchain/mobile lint       # Mobile ESLint
pnpm --filter @lexchain/web lint          # Web ESLint
pnpm --filter @lexchain/web build         # Web production build
pnpm --filter @lexchain/types generate  # Regenerate schema.ts
```

## SOFTWARE ENGINEERING PRINCIPLES

- **Readability first**: Code a student teammate can understand later.
- **KISS**: Simplest solution that fully solves the task.
- **DRY carefully**: Extract only when reuse is clear and proven.
- **YAGNI**: Build only what is required right now.
- **Single responsibility**: One clear purpose per function, component, hook, service, module.
- **Consistency over new abstractions**: Follow existing patterns before inventing.
- **Minimize blast radius**: Smallest safe change preserving existing behavior.
- **Reuse before create**: Check existing components, hooks, services, types before adding.
- **No unjustified dependencies**: Don't add libraries for simple helpers or formatting.
- **Prefer explicit over magic**: Avoid hidden side effects and unclear abstractions.

### Do
- Small, reviewable changes. Boring, predictable code over clever code.
- Explain tradeoffs in comments only when code isn't self-explanatory.
- Follow existing project patterns (mobile: `apps/mobile/AGENTS.md`, web: `apps/web/AGENTS.md`).

### Don't
- Rewrite whole features to change one behavior.
- Create generic abstractions for one-time use.
- Change unrelated files for style preference.
- Introduce architecture the current feature doesn't need.

---

## EXPO REACT NATIVE + WEB RULES (Mobile)

**Full details:** `apps/mobile/AGENTS.md` (925 lines). Summary below.

### Stack
Expo SDK 54 | React Native 0.81 | React 19 | NativeWind v5 + Tailwind v4 | TanStack Query | Zod v4 | ECC crypto (`ecc-universal` v1.9.0)

### Core Rules
- **TypeScript** for all new code. Functional components + hooks only.
- **Expo Router** for navigation — file-based routing, route groups, layouts. No custom navigation abstractions.
- **NativeWind v5** via `@/tw` utilities. `StyleSheet.create` only when NativeWind is awkward.
- **React Query** for all server state. Hooks in `src/services/query/`. No raw `fetch` in screens.
- **Zod v4** + `react-hook-form` for validation. Schemas in `src/features/*/schemas/`.
- **Import aliases**: `@/` path aliases. Never relative paths for shared modules.
- **Feature-first**: New features in `src/features/<name>/`. Shared code in `src/shared/`.
- **Index exports**: Every feature/service has `index.ts` re-exporting public members.

### Navigation
- `router.replace(...)` for auth transitions (prevents screen stacking).
- `router.push(...)` only when previous screen should stay in history.
- Route names must match actual files in `app/`.

### Anti-Patterns (Mobile)
- **BottomSheet**: Must use `default` import from `@gorhom/bottom-sheet`. Named import crashes.
- **lightningcss**: Must stay pinned to `1.30.1`. Drift breaks NativeWind.
- **Agent files**: Never import `.agents/` or `.agent/` into runtime code.
- **Themed primitives**: Never bypass `ThemedText`/`ThemedView` for routine UI.
- **Web routes**: Do NOT reintroduce Expo web-only landing/admin/public verifier routes.

### Security (Mobile)
- No secrets, private keys, or backend credentials in frontend code.
- Client-side checks are UX only — backend is source of truth.
- Secure storage centralized in `src/shared/utils/secure-storage.ts`.

---

## NEXT.JS WEB RULES

**Full details:** `apps/web/AGENTS.md`. Summary below.

### Stack
Next.js 16.2.6 | React 19.2 | TypeScript 5 | Tailwind v4 | ESLint (eslint-config-next)

### Core Rules
- **App Router**: Server components by default. Read `node_modules/next/dist/docs/` for breaking changes.
- **Tailwind v4**: `@tailwindcss/postcss` — CSS-first configuration.
- **Workspace packages**: `@lexchain/api`, `@lexchain/config`, `@lexchain/types` transpiled via `next.config.ts`.
- **API routes**: Route handlers in `app/api/` proxy to FastAPI backend at `http://localhost:8000`.
- **TypeScript strict mode** enabled.

### Environment
- `NEXT_PUBLIC_API_URL` — client-accessible backend URL.
- `API_URL` — server-side backend URL.
- Never hardcode backend URLs — always use env vars.

### Anti-Patterns (Web)
- **Do NOT** reintroduce Expo web-only routes — Next.js owns admin/public verifier exclusively.
- **Do NOT** bypass route handlers for direct backend calls from client components.
- **Do NOT** import mobile-specific code (`apps/mobile/`) into web app.
- **Do NOT** hardcode `http://localhost:8000` — use env vars.

### Security (Web)
- Server-side route handlers for sensitive operations (admin, auth proxying).
- Never expose backend credentials or API keys in client components.
- Validate all user input server-side before forwarding to backend.

---

## NOTES

- Branch: `feat/monorepo-restructuring` — active restructuring in progress.
- No test runner configured in any workspace.
- CI: single workflow `.github/workflows/react-doctor.yml`.
- Backend expects Python/FastAPI at `http://localhost:8000` (see `.env.example`).
