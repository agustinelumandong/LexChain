# LexChain Frontend 👋

> **For AI agents:** Read `AGENTS.md` before making any changes. It documents project conventions, anti-patterns, and instructions that take priority over generic Expo/React Native advice.

## Stack

- **Expo SDK** 54 + React Native 0.81 + React 19
- **Expo Router** file-based routing
- **NativeWind v5** + Tailwind CSS v4
- **TanStack Query** server state
- **Zod v4** + `react-hook-form` validation
- **ECC cryptography** via `ecc-universal` for document signing/verification

## Get Started

```bash
pnpm install
pnpm run start        # Dev server
pnpm run android      # Android
pnpm run ios          # iOS
pnpm run web          # Web
pnpm run lint         # ESLint
pnpm run reset-project  # Move app/ → app-example/, reset to blank
```

## Project Structure

- `app/` — Expo Router routes
- `src/features/` — Feature modules (auth, dashboard, documents, upload, profile)
- `src/shared/` — Shared components, hooks, theme, utils
- `src/services/` — API client + React Query hooks
- `src/types/` — TypeScript types
- `.agents/` — Agent skills and rules (dev docs only, not imported in runtime)

## Key Docs

| Doc | Purpose |
|---|---|
| `AGENTS.md` | Agent guidance — conventions, anti-patterns, checklists |
| `docs/openapi.json` | Backend API contract |
| `docs/BACKEND-INTEGRATION.md` | Backend setup guide |
| `docs/` | Design files, TODOs, integration notes |

## Backend

This frontend expects a Python/FastAPI backend. See `docs/BACKEND-INTEGRATION.md` for setup. API contract: `docs/openapi.json`.
