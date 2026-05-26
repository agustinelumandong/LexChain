# PROJECT KNOWLEDGE BASE — LexChain Web

**Generated:** 2026-05-17
**Commit:** f149e9f
**Branch:** feat/monorepo-restructuring
**Stack:** Next.js 16.2.6 | React 19.2 | TypeScript 5 | Tailwind v4

## Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

## OVERVIEW

Next.js web app for LexChain: public document verifier, admin panel, marketing landing, and API route handlers proxying to Python/FastAPI backend.

## STRUCTURE

```
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Marketing landing page
│   ├── globals.css         # Global styles (Tailwind)
│   ├── favicon.ico
│   ├── admin/              # Admin panel (web-only — mobile must NOT import)
│   ├── api/                # API route handlers (proxy to backend)
│   │   ├── admin/          # Admin API routes
│   │   └── public/         # Public API routes (no auth)
│   ├── verify/             # Public document verifier (browser)
│   ├── download/           # Download page
│   ├── invite/             # Invite fallback page
│   ├── terms/              # Terms of service
│   └── privacy/            # Privacy policy
├── lib/                    # Shared utilities
│   ├── admin-api.ts        # Admin API client
│   └── public-verifier-api.ts  # Public verifier API client
├── public/                 # Static assets
│   └── lexchain/           # Brand assets
├── .env                    # Environment variables
├── .env.example            # Env template (NEXT_PUBLIC_API_URL, API_URL → localhost:8000)
├── next.config.ts          # Config: transpilePackages for @lexchain/*, allowedDevOrigins
├── eslint.config.mjs       # ESLint config (eslint-config-next)
├── postcss.config.mjs      # PostCSS (@tailwindcss/postcss)
└── tsconfig.json           # TypeScript config
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Landing page | `app/page.tsx` | Marketing homepage |
| Admin panel | `app/admin/` | Web-only admin routes |
| Public verifier | `app/verify/` | Browser document verification |
| API routes | `app/api/` | Route handlers proxying to FastAPI |
| Admin API client | `lib/admin-api.ts` | Admin API utilities |
| Public verifier client | `lib/public-verifier-api.ts` | Public verification utilities |
| Env config | `.env.example` | `NEXT_PUBLIC_API_URL`, `API_URL` → `http://localhost:8000` |
| Next.js config | `next.config.ts` | `transpilePackages` for workspace packages |

## CONVENTIONS

- **Next.js 16**: App Router, server components by default. Read `node_modules/next/dist/docs/` for breaking changes.
- **Tailwind v4**: `@tailwindcss/postcss` — CSS-first configuration.
- **Workspace packages**: `@lexchain/api`, `@lexchain/config`, `@lexchain/types` transpiled via `next.config.ts`.
- **API routes**: Route handlers in `app/api/` proxy requests to FastAPI backend at `http://localhost:8000`.
- **TypeScript strict mode** enabled.
- **ESLint**: `eslint-config-next` (v16.2.6).

## ANTI-PATTERNS

- **Do NOT** reintroduce Expo web-only routes for admin/public verifier — Next.js owns these exclusively.
- **Do NOT** hardcode backend URLs — use `process.env.NEXT_PUBLIC_API_URL` or `process.env.API_URL`.
- **Do NOT** bypass route handlers for direct backend calls from client components.
- **Do NOT** import mobile-specific code (`apps/mobile/`) into web app.

## COMMANDS

```bash
pnpm run web                    # Dev server (next dev)
pnpm run web:build              # Production build (next build)
pnpm --filter web lint          # ESLint
pnpm --filter web start         # Production server (next start)
```

## NOTES

- Backend: Python/FastAPI at `http://localhost:8000`.
- No test runner configured.
- Part of monorepo — see root `AGENTS.md` for cross-app boundaries.
- Active branch: `feat/monorepo-restructuring`.
