# LexChain web API inventory (captured 2026-09-09)

Scope: current `apps/web` working tree, verified after codebase-memory graph discovery. All backend URLs use `backendUrl()` (`API_URL` / `NEXT_PUBLIC_API_URL`).

## Shared request funnels

| Domain client / callers | Next handler | Upstream method + path | Auth cookie | Mock / tests |
|---|---|---|---|---|
| `app/portal/lib/portal-fetch.ts`; many inline reads in portal layout/pages | `GET /api/portal/proxy?path=...` | GET, arbitrary supplied path | `portal_token` -> Bearer | `lib/portal-mock.ts::mockPortalGet`; handler test: `app/api/portal/proxy/route.test.ts`; mock contract: `lib/portal-mock.test.ts` |
| `document-lifecycle-api.ts`, `extraction-api.ts`, `portal-upload.ts`; inline portal mutations | `POST/PATCH/DELETE /api/portal/proxy-post?path=...` | same method, arbitrary supplied path; forwards JSON or multipart | `portal_token` -> Bearer | `mockPortalMutate`; client tests: `document-lifecycle-api.test.ts`, `extraction-api.test.ts`, `portal-upload.test.ts`; mock test above |
| `portal-access-api.ts` | dedicated `/api/portal/documents/:id/parties[/partyUserId]` and `/audit-logs` | GET/POST `/documents/:id/parties`; DELETE `/documents/:id/parties/:partyUserId`; GET `/documents/:id/audit-logs` | `portal_token`; handlers first GET `/users/` for issuer check, then Bearer upstream | tests beside every dedicated route; audit test also imports `mockPortalMutate` |

Generic portal upstream paths currently used: GET `/users/`, `/documents/`, `/documents/:id`, `/documents/:id/versions`, `/documents/:id/snapshots`, `/documents/:id/extraction`, `/documents/:id/verify`, `/books/`, `/books/:id`, `/notifications/`, `/notifications/unread-count`, invitation/request collections; mutations `/documents/upload`, `/:id` PATCH, `/:id/update`, `/:id/finalize`, `/:id/restore`, extraction PATCH/analyze/approve, snapshot restore, `/documents/:id/ask`, `/search`, books POST/DELETE, invitation accept/decline, request review, notification read/read-all.

`integrity-api.ts` is a thin client for GET `/documents/:id/verify` through the generic GET handler (`integrity-api.test.ts`). `portal-access-api.ts` deliberately uses dedicated handlers because those add issuer authorization/validation.

## Auth and upload

| Caller | Next handler | Upstream | Cookies / mocks / tests |
|---|---|---|---|
| `app/login/page.tsx::signIn` | `POST /api/auth` | POST `/auth/signin`; fallback GET `/users/` when response lacks role | sets httpOnly `portal_token`; conditionally `issuer_token`; clears `admin_token`; readable `user_role`. Inline mock accounts when mock env is on. `app/api/auth/route.test.ts` |
| `app/register/page.tsx::signUp` | `POST /api/portal/signup` | POST `/auth/signup` | no auth cookie; no colocated test |
| `auth/verified/verified-content.tsx` | `POST /api/portal/resend-verification` | POST `/auth/resend-verification` | no auth cookie; no colocated test |
| `portal-upload.ts::uploadDocument` | generic proxy-post | multipart POST `/documents/upload?book_id=...&file_name=...` | `portal_token`; `portal-upload.test.ts`, mock mutate supports upload |
| dedicated blockchain action | `POST /api/portal/blockchain/record/:id` | GET `/users/` issuer check, then POST `/blockchain/record/:id` | `portal_token`; `route.test.ts` |
| logout UIs | `POST /api/portal/logout`, `POST /api/admin/logout` | no upstream | both delete session cookies as implemented; route tests exist, plus `admin-shell.test.tsx` asserts URL |

## Admin

| Client / server caller | Next/upstream | Auth | Tests / mock behavior |
|---|---|---|---|
| Client admin invitation create/revoke views | `/api/admin/invitations` GET/POST; `/:id` DELETE -> same `/admin/invitations...` upstream | handlers parse `issuer_token`; accept mock issuer token | route tests for invitations and revoke; component tests exercise views |
| Portal dashboard admin query | `GET /api/admin/dashboard` -> GET `/admin/dashboard` | `issuer_token` | `dashboard/route.test.ts` |
| API handlers `/api/admin/users`, `/audit-logs` | GET `/admin/users`, `/admin/audit-logs` | `issuer_token` | no colocated route tests found |
| `app/admin/actions.ts` server actions | direct GET dashboard/users/invitations and DELETE invitation upstream | reads `issuer_token` via `cookies()` | bypasses Next API handlers; no direct tests found |
| `app/admin/components/admin-fetch.ts` server helper | direct arbitrary admin upstream path | reads `issuer_token`, redirects `/admin/login` if absent | server-only by behavior; no test found |

`lib/admin-api.ts` is the shared server transport (`backendUrl`, Bearer `adminFetch`, cookie parser). Despite the name, portal/auth handlers import `backendUrl` from it, so moving it into an admin-only domain would break portal/auth server code.

## Relocation and server/client hazards

- `lib/portal-mock.ts` imports `../app/portal/lib/document-lifecycle-ui`; this reverses the intended dependency and will break if portal UI code moves. It is also imported by server handlers and client components/pages (`portal/users`, issuer invitations, audit logs, chatbot), so moving it behind a server-only boundary is unsafe until client mock-mode checks are separated.
- Dedicated portal handlers import UI-domain modules from `@/app/portal/lib`: `portal-role`, `participant-access`. These modules must remain server-safe (no client-only imports), or their validation/role primitives should relocate with neutral domain code.
- `app/portal/lib/issuer-page-access.ts`, `app/admin/actions.ts`, and `app/admin/components/admin-fetch.ts` use `cookies()` / server redirects/direct backend access. Do not export them from a barrel consumed by `'use client'` pages.
- Client-safe API modules (`portal-fetch`, lifecycle, extraction, integrity, portal-access, upload) use relative browser `/api/...` URLs and DOM types (`File`, `FormData` in lifecycle/upload). They should stay in a client-safe domain layer.
- `app/login/page.tsx` imports `../portal/lib/portal-role`; route restructuring changes this relative import. Admin views also reach into portal domain (`portal-role`, `office-insight`) through relative paths.
- Relocation-sensitive tests assert exact URLs or import colocated modules: all `app/api/**/route.test.ts`; `portal/lib/{document-lifecycle-api,extraction-api,integrity-api,portal-upload}.test.ts`; `portal/books/page.test.tsx`; `lib/portal-mock.test.ts`; `app/mock-documents/[fileName]/route.test.ts`; admin view/shell tests. Move tests with implementations or update aliases and keep exact proxy URL assertions.
- Security boundary: both generic portal proxy handlers accept an arbitrary `path` and pass it to `backendUrl`; preserve whatever same-origin/base-path guarantees `buildApiUrl` provides and do not expose a client-controlled absolute-URL escape during migration.

## Practical migration seams

Keep three seams: (1) client domain functions calling relative Next endpoints, (2) server route transports/cookie parsing, (3) mock data/dispatch. The smallest consolidation target is the repeated client proxy request wrapper (`lifecycleFetch`, `portalRequest`, `portalFetch`), but preserve their distinct error types/behavior unless the migration explicitly changes contracts.
