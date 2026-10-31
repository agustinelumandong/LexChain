# LexChain frontend codebase map

This file helps agents find the frontend modules that participate in the whole LexChain system. It is a repository map, not a copy of every rule or setup command.

Start with [AGENTS.md](AGENTS.md) for working rules, [README.md](README.md) for setup and commands, [system architecture](docs/ARCHITECTURE.md) for frontend/backend ownership, and [user flows](docs/USER-FLOW-ARCHITECTURE.md) for detailed journeys. The sibling FastAPI service is the separate `lexchain-backend` repository when available.

## System boundary

This repository owns the Next.js App Router application and PWA. It owns pages, user interaction, frontend validation, session cookies, same-origin API adapters, and rendering of backend results. It does not own authoritative permissions, document lifecycle rules, persistence, OCR, indexing, or blockchain state.

Browser code normally calls a same-origin Next.js route handler. The handler reads the HttpOnly session token and forwards it to FastAPI as a bearer token. Some auth, signup, participant, admin, audit, and file operations have dedicated routes; server-rendered pages and Server Actions may call the server-only backend helper directly. The route map and processing sequence live in `docs/USER-FLOW-ARCHITECTURE.md`.

## Frontend map

| Path | Responsibility |
| --- | --- |
| `src/app/` | Next.js routes, layouts, API receivers/proxies, and route integration |
| `src/proxy.ts` | Coarse session and legacy-route redirects |
| `src/features/` | Feature-owned views, API helpers, queries, actions, forms, and UI state |
| `src/shared/components/` | Browser-safe reusable UI |
| `src/shared/api/` | Shared same-origin browser transport |
| `src/server/api/backend.ts` | Server-only backend URL, token, and request helpers |
| `src/config/api.ts` | Pure backend URL configuration |
| `src/shared/types/generated/schema.ts` | Generated TypeScript view of the checked-in OpenAPI snapshot |
| `src/lib/mocks/` | Local mock fixtures and mock-mode behavior; keep fixtures out of client bundles |
| `src/pwa/`, `public/sw.js` | Production service-worker registration and static offline fallback |
| `scripts/`, `e2e/` | Contract maintenance and browser checks |

Common integration seams:

- `src/app/api/portal/proxy/route.ts` forwards GET requests; `src/app/api/portal/proxy-post/route.ts` forwards mutations and multipart uploads.
- `src/app/api/auth/route.ts` establishes the frontend session cookies after backend sign-in. The readable role cookie drives navigation only; backend authorization remains authoritative.
- `src/app/api/portal/documents/[id]/file/route.ts` obtains an authorized backend file URL and streams the file through the frontend origin.
- Feature request helpers live with their feature, for example `src/features/documents/document-lifecycle-api.ts` and `src/features/verification/integrity-api.ts`.

## Backend-connected document flow

The frontend exposes two intake paths: prepare a record and attach its signed PDF, or upload an already-signed PDF. When attaching to a prepared record, the lawyer selects a register book; closed books require paper document and page numbers. After filing, the frontend reads backend-owned state and permissions. Finalization re-reads the stored PDF, checks its SHA-256, asks the configured blockchain provider to record that hash, and commits an OCR-dispatch record before queueing the job. The provider factory selects Web3 only when `ENVIRONMENT=development`; other values select a mock, so local source does not prove deployed on-chain anchoring. A lawyer reviews and approves extracted text; approval queues enrichment for search and Q&A. A failed processing job can be retried by its owner without repeating finalization. The PDF fingerprint and approved-text hash have separate purposes. See `docs/ARCHITECTURE.md` for the system diagram and source limits.

The frontend does not run this pipeline. Processing status, action permissions, document records, and verification outcomes come from the backend. Mock flows may differ and do not establish live integration.

## Contract and evidence

The backend builds OpenAPI from its mounted FastAPI routes and schemas. `openapi-updated.json` and generated TypeScript types in this repository are snapshots used for frontend typing; they may lag backend source and do not validate runtime responses. For endpoint or payload questions, compare the frontend caller, current backend router/schema/service, and the contract. Use deployed runtime evidence to confirm actual integration.

`docs/ARCHITECTURE.md` is the current cross-repository architecture entry point. The sibling backend `CODEBASE.md` currently carries a warning that its detailed lifecycle sections describe an older flow; inspect the backend source it points to instead.
