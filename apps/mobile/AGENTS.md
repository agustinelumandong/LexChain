# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-14T23:58:00+08:00
**Commit:** 49bd004c
**Branch:** dev
**Expo SDK:** 54.0.33 | React Native: 0.81.5 | React: 19.1.0

---

## OVERVIEW

Expo Router frontend (React Native + web) for LexChain document management. Features: upload documents, AI-powered processing, document verification with ECC cryptography, access whitelisting, and user profiles.

**Backend expects:** Python/FastAPI (see `docs/openapi.json` for API contract).

---

## STRUCTURE (VERIFIED)

```text
frontend/
├── app/                          # Expo Router route tree + layouts
│   ├── _layout.tsx               # Native root layout (Stack + all providers)
│   ├── _layout.web.tsx           # Web root layout (redirects non-allowed paths to /)
│   ├── index.tsx                 # Native landing + BottomSheet
│   ├── index.web.tsx             # Web: renders WebsiteLandingScreen
│   ├── modal.tsx                 # Modal presentation
│   ├── upload.tsx                # Upload flow (native)
│   ├── upload.web.tsx            # Web: redirects to /
│   ├── camera-capture.tsx        # Camera capture (native)
│   ├── camera-capture.web.tsx    # Web: redirects to /
│   ├── capture-review.tsx        # Review captured images (native)
│   ├── capture-review.web.tsx    # Web: redirects to /
│   ├── processing.tsx            # AI processing screen (native)
│   ├── processing.web.tsx        # Web: redirects to /
│   ├── (auth)/
│   │   ├── _layout.tsx           # Auth navigation wrapper (slide+fade transitions)
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── forgot-password.tsx
│   │   └── callback.tsx          # OAuth callback handler
│   ├── auth/
│   │   └── callback.tsx          # OAuth deep-link callback (mirrors (auth)/callback)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tabs (hidden, route groups only)
│   │   ├── index.tsx             # Home tab (native)
│   │   ├── index.web.tsx         # Web: redirects to /
│   │   ├── documents.tsx         # Documents tab (native)
│   │   ├── documents.web.tsx     # Web: redirects to /
│   │   ├── profile.tsx           # Profile tab (native)
│   │   └── profile.web.tsx       # Web: redirects to /
│   ├── document/
│   │   ├── [id].tsx              # Document detail route (native)
│   │   ├── [id].web.tsx          # Web: redirects to /
│   │   └── pdf-viewer.tsx        # In-app PDF viewer (native)
│   ├── verify/
│   │   ├── [id].tsx              # Document verification (native)
│   │   └── [id].web.tsx          # Web: redirects to /
│   ├── profile/
│   │   ├── account.tsx
│   │   ├── notifications.tsx
│   │   ├── security.tsx
│   │   ├── privacy.tsx
│   │   └── support.tsx
│   ├── public/                   # Unauthenticated public web routes
│   │   ├── _layout.tsx           # Stack, headerShown: false
│   │   └── verify/
│   │       ├── index.tsx         # PDF upload verifier (PublicVerifierDom)
│   │       └── [code].tsx        # Code-based verification (PublicVerifyWebScreen)
│   └── admin/                    # Admin panel (web-only)
│       ├── _layout.tsx
│       ├── login.tsx
│       └── (protected)/
│           ├── _layout.tsx
│           ├── dashboard.tsx
│           ├── documents.tsx
│           ├── users.tsx
│           ├── analytics.tsx
│           ├── audit-logs.tsx
│           ├── blockchain-records.tsx
│           ├── categories.tsx
│           ├── document-issuers.tsx
│           ├── invitations-permissions.tsx
│           ├── ocr-nlp-processing.tsx
│           ├── system-settings.tsx
│           └── verification-logs.tsx
├── src/
│   ├── features/                 # Feature modules
│   │   ├── auth/                 # Auth components + Zod schemas + OAuth callback
│   │   │   ├── auth-header.tsx
│   │   │   ├── auth-input.tsx
│   │   │   ├── auth-screen-shell.tsx
│   │   │   ├── terms-bottom-sheet.tsx
│   │   │   ├── schemas/          # sign-in.schema.ts, sign-up.schema.ts
│   │   │   └── callback/         # auth-callback-screen.tsx, auth-callback.params.ts
│   │   ├── admin/                # Admin panel screens + API + hooks
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── types.ts
│   │   │   ├── components/       # AdminSidebar, AdminDataTable, AdminStatCard
│   │   │   └── screens/          # AdminDashboardScreen, AdminLoginScreen, etc.
│   │   ├── dashboard/            # Home KPI cards + recent list
│   │   ├── document/             # Document detail components + services
│   │   │   ├── components/       # Sheets, cards, PDF viewer, whitelist UI
│   │   │   └── services/         # whitelist-mappers, whitelist-storage, document-permissions
│   │   ├── documents/            # Document list/search/filter
│   │   ├── onboarding/           # GetStartedHero
│   │   ├── profile/              # Profile screens + settings
│   │   ├── upload/               # Upload session, type picker, dropzone
│   │   ├── verification/         # Public document verification
│   │   │   ├── api.ts            # verifyDocumentByCode (stub — no backend endpoint yet)
│   │   │   ├── hooks.ts          # usePublicVerification
│   │   │   ├── types.ts          # PublicVerificationResult, PublicVerificationStatus
│   │   │   ├── components/
│   │   │   │   ├── PublicVerifierDom.tsx      # "use dom" PDF upload verifier
│   │   │   │   ├── VerificationResultCard.tsx
│   │   │   │   └── VerificationStatusBadge.tsx
│   │   │   └── screens/
│   │   │       └── PublicVerifyWebScreen.tsx
│   │   └── website/              # Marketing landing page (web-only)
│   │       ├── web-home-redirect.tsx
│   │       ├── components/       # WebNavbar, WebHero, WebFeatures, WebFooter, etc.
│   │       └── screens/          # WebsiteLandingScreen
│   ├── shared/
│   │   ├── components/           # Primitives (ThemedText, Screen, etc.)
│   │   │   └── ui/               # Button, IconSymbol, QueryStates, OfflineBanner, etc.
│   │   ├── hooks/                # useThemeColor, useColorScheme, useNetwork, etc.
│   │   ├── providers/            # queryClient singleton
│   │   ├── theme/                # Colors, Fonts, APP_COLORS
│   │   ├── utils/                # api-error parser, secure-storage, tw utilities
│   │   └── config/               # Environment config (env.ts)
│   ├── services/
│   │   ├── api/                  # API modules + generated schema
│   │   │   ├── client.ts         # Base request wrapper with auth interceptors
│   │   │   ├── auth.api.ts
│   │   │   ├── documents.api.ts
│   │   │   ├── public.api.ts     # POST /public/verify (file upload)
│   │   │   ├── admin.api.ts
│   │   │   ├── blockchain.api.ts
│   │   │   ├── users.api.ts
│   │   │   ├── openapi-client.ts
│   │   │   ├── generated/        # schema.ts (auto-generated from openapi.json)
│   │   │   └── mock/             # Mock implementations for all APIs
│   │   └── query/                # React Query hooks
│   │       ├── use-auth.ts
│   │       ├── use-documents.ts
│   │       ├── use-admin.ts
│   │       ├── use-blockchain.ts
│   │       ├── use-public.ts
│   │       ├── use-users.ts
│   │       └── keys.ts           # Centralized query key factory
│   ├── types/                    # auth.types, document.types, upload.types
│   ├── mocks/                    # Mock data (dev mode)
│   ├── constants/                # storage-keys constants
│   └── tw/                       # NativeWind/Tailwind utilities
├── .agents/                      # LOCAL AGENT SKILLS (do not import in runtime code)
│   ├── AGENTS.md
│   ├── rules/
│   │   └── expo.md               # Expo project rule — READ THIS FIRST
│   ├── skills/
│   │   ├── building-native-ui/
│   │   ├── expo-api-routes/
│   │   ├── expo-cicd-workflows/
│   │   ├── expo-deployment/
│   │   ├── expo-dev-client/
│   │   ├── expo-module/
│   │   ├── expo-tailwind-setup/
│   │   ├── expo-ui-jetpack-compose/
│   │   ├── expo-ui-swiftui/
│   │   ├── native-data-fetching/
│   │   ├── ui-ux-pro-max/
│   │   ├── upgrading-expo/
│   │   └── use-dom/
│   └── plugins/marketplace.json
├── .agent/                       # User-level agent config (mirrors .agents)
│   ├── rules/expo.md
│   └── skills/
├── graphify-out/                 # Knowledge graph output
├── docs/                         # Design docs, TODOs, integration notes
│   ├── openapi.json              # Backend API specification
│   ├── expo-llms/                # Cached Expo LLM docs (llms.txt, llms-sdk.txt, llms-eas.txt)
│   └── BACKEND-INTEGRATION.md
└── assets/images/                # Static images
```

---

## MANDATORY READING ORDER

### When starting a session or receiving a task:

1. **FIRST:** Read `.agents/rules/expo.md` (or `.agent/rules/expo.md`) — enforces Expo LLM docs usage.
2. **THEN:** Check `AGENTS.md` (this file) for project-level conventions.
3. **THEN:** Check `graphify-out/GRAPH_REPORT.md` for god nodes and community structure when answering architecture questions.
4. **THEN:** Check the relevant skill docs listed in **SKILL LOADING REMINDER** before implementation.

---

## PRIORITY OF INSTRUCTIONS

When instructions conflict, follow this order:

1. User's explicit request for the current task
2. Safety/security rules
3. `.agents/rules/expo.md`
4. This `AGENTS.md`
5. Existing code patterns near the edited file
6. Generic framework advice

Do not follow generic React Native or Expo advice if it conflicts with this repository's documented patterns.

---

## ANTI-PATTERNS / DO NOT BREAK

### BottomSheet Import
- **Must use `default` import** from `@gorhom/bottom-sheet`. Named import causes `Element type is invalid` error.
  ```tsx
  // ✅ Correct
  import BottomSheet from '@gorhom/bottom-sheet';
  import { BottomSheetModal, BottomSheetBackdrop, ... } from '@gorhom/bottom-sheet';

  // ❌ Wrong — will crash
  import { BottomSheet } from '@gorhom/bottom-sheet';
  ```

### BottomSheet Footer TextInput + Keyboard
- When a `TextInput` lives inside `BottomSheetModal.footerComponent`, **do not keep the input value in the parent sheet component** if that value is part of the `footerComponent` callback dependencies. Every keystroke can recreate/remount the footer, blur the input, and close the keyboard.
- Keep composer/input state inside a small stable footer component (for example `AskComposer`) and only call the parent on submit.
- Avoid React `Keyboard` listener state for moving a focused footer composer when typing. State updates during keyboard open can re-render the footer and cause focus flicker. Prefer `react-native-reanimated` `useAnimatedKeyboard()` + `useAnimatedStyle()` so the footer moves above the keyboard on the UI thread.
- If the footer moves above the keyboard, add enough `BottomSheetScrollView` bottom padding so long conversations or forms can still scroll above the raised footer.

### Package Manager
- Both `package-lock.json` and `pnpm-lock.yaml` exist. Use `pnpm` for all changes.

### lightningcss Version
- **Must stay pinned to `1.30.1`** in both `overrides` and `pnpm.overrides` in `package.json`. Drift to `1.32.0` breaks NativeWind bundling with `failed to deserialize; expected an object-like struct named Specifier`.

### Auth Navigation
- Use `router.replace(...)`, NOT `router.push(...)` for auth toggle buttons ("Create account" ↔ "Sign in"). Prevents screen stacking when spam-tapped.

### Navigation Abstractions
- **DO NOT** add parallel navigation abstractions outside Expo Router route files.

### Themed Primitives
- **DO NOT** bypass `ThemedText`, `ThemedView`, `Colors` for routine UI text/view rendering.

### Agent Files in Runtime
- **DO NOT** import `.agents/` files into runtime code paths. Agent docs are for development sessions only.

---

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| App entry | `package.json` (`main: "expo-router/entry"`) | Expo Router auto-discovery |
| Root layout (native) | `app/_layout.tsx` | Stack navigator + all providers |
| Root layout (web) | `app/_layout.web.tsx` | Redirects non-allowed paths to `/`; allowed: `/`, `/admin`, `/public` |
| Tab layout | `app/(tabs)/_layout.tsx` | Tabs hidden, used as route groups |
| Auth screens | `app/(auth)/` + `src/features/auth/` | Sign-in, sign-up, forgot password |
| OAuth callback | `app/(auth)/callback.tsx` + `app/auth/callback.tsx` | Handles OAuth deep-link + web redirect |
| Auth schemas | `src/features/auth/schemas/` | Zod schemas (sign-up, sign-in) |
| Upload flow | `app/upload.tsx` + `src/features/upload/` | Full upload session |
| Camera capture | `app/camera-capture.tsx` → `capture-review.tsx` → `processing.tsx` | Multi-step capture |
| Document detail | `app/document/[id].tsx` + `src/features/document/` | Detail view + sheets |
| Document list | `app/(tabs)/documents.tsx` + `src/features/documents/` | Search, filter, sort sheets |
| Profile | `app/(tabs)/profile.tsx` + `src/features/profile/` | Profile + settings |
| Profile sub-screens | `app/profile/` | account, notifications, security, privacy, support |
| Public verifier (PDF) | `app/public/verify/index.tsx` + `PublicVerifierDom` | DOM component, web-only PDF upload |
| Public verifier (code) | `app/public/verify/[code].tsx` + `PublicVerifyWebScreen` | Code-based lookup (backend stub) |
| Admin panel | `app/admin/` + `src/features/admin/` | Web-only; login + protected routes |
| Website landing | `app/index.web.tsx` + `src/features/website/` | Marketing page, web-only |
| Web redirect stubs | `app/**/*.web.tsx` | All native-only routes redirect to `/` on web |
| API client | `src/services/api/client.ts` | Base request wrapper with interceptors |
| Auth API | `src/services/api/auth.api.ts` | Login, logout, register, verify |
| Documents API | `src/services/api/documents.api.ts` | CRUD, search, whitelist |
| Public API | `src/services/api/public.api.ts` | `POST /public/verify` (file upload, no auth) |
| Admin API | `src/services/api/admin.api.ts` | Admin CRUD operations |
| Blockchain API | `src/services/api/blockchain.api.ts` | Notarize + on-chain verify |
| Generated schema | `src/services/api/generated/schema.ts` | Auto-generated from `docs/openapi.json` |
| Mock APIs | `src/services/api/mock/` | auth, documents, public, admin, blockchain, users |
| Auth hooks | `src/services/query/use-auth.ts` | useSignIn, useSignUp, useResendVerification |
| Doc hooks | `src/services/query/use-documents.ts` | useDocuments, useDocument, useGlobalSearch, etc. |
| Admin hooks | `src/services/query/use-admin.ts` | Admin React Query hooks |
| Public hooks | `src/services/query/use-public.ts` | Public verification React Query hooks |
| Query keys | `src/services/query/keys.ts` | Centralized query key factory |
| Query client | `src/shared/providers/query-client.ts` | Singleton QueryClient + focus listener |
| Theme tokens | `src/shared/theme/theme.ts` | Colors (light/dark), Fonts, APP_COLORS |
| UI primitives | `src/shared/components/ui/` | Button, IconSymbol, QueryStates, OfflineBanner, etc. |
| Shared hooks | `src/shared/hooks/index.ts` | useThemeColor, useColorScheme, useNetwork, etc. |
| Error handling | `src/shared/utils/api-error.ts` | parseApiError() — the god node |
| Secure storage | `src/shared/utils/secure-storage.ts` | Auth token persistence |
| Types | `src/types/index.ts` | auth, document, upload type exports |
| Path aliases | `tsconfig.json` | `@/`, `@/ui`, `@/theme`, `@/hooks`, `@/types`, etc. |
| API contract | `docs/openapi.json` | Backend API specification |
| Expo LLM docs | `docs/expo-llms/` | Cached: llms.txt, llms-sdk.txt, llms-eas.txt |
| Design files | `docs/` | Figma exports, TODO lists, integration docs |
| Auth toggle | Auth screens → `router.replace(...)` NOT `router.push(...)` | Prevents screen stacking |

---

## CODE MAP — GOD NODES

These are the most connected abstractions. Changes here ripple widely.

| Symbol | Type | Location | Role |
|---|---|---:|---|
| `parseApiError()` | function | `src/shared/utils/api-error.ts` | **God node** — 11 edges, cross-community bridge |
| `ThemedText()` | component | `src/shared/components/themed-text.tsx` | Theme-aware text (4 edges) |
| `ThemedView()` | component | `src/shared/components/themed-view.tsx` | Theme-aware container (4 edges) |
| `request()` | function | `src/services/api/client.ts` | HTTP client with auth interceptors (4 edges) |
| `buildCapturedFile()` | function | Camera flow | Processes captured images (3 edges) |
| `handleFinishCapture()` | function | Camera flow | Commits capture session (3 edges) |
| `mapDocument()` | function | Documents feature | Maps API response to type (3 edges) |
| `slideFade()` | function | Auth transitions | Custom auth animation (3 edges) |
| `useColorScheme()` | hook | `src/shared/hooks/use-color-scheme*.ts` | Theme mode source (3 edges) |
| `useThemeColor()` | hook | `src/shared/hooks/use-theme-color.ts` | Token fallback resolver (3 edges) |

### Key Communities (from graphify)

| Community | Nodes | Notes |
|-----------|-------|-------|
| Auth flow | `slideFade()`, `forSlideFadeFromLeft()`, `forSlideFadeFromRight()` | High cohesion (0.6) |
| API client | `buildUrl()`, `isFormDataBody()`, `parseResponse()`, `request()` | High cohesion (0.7) |
| Whitelist | `applyWhitelistToDocument()`, `loadWhitelistMap()`, `persistDocumentWhitelist()` | Related to access control |
| Document UI | `AccessWhitelistCard()`, `DocumentScreenHeader()`, `DocumentSummaryCard()` | Document detail components |

---

## CONVENTIONS

- **NativeWind v5 + Tailwind v4**: Use `@/tw` utilities; avoid raw StyleSheet unless necessary.
- **React Query**: All server state via `@tanstack/react-query`; invalidation on mutations.
- **Zod v4**: Schema validation in `src/features/*/schemas/`; use with `react-hook-form`.
- **ECC crypto**: `ecc-universal` v1.9.0 for document signing/verification.
- **Import aliases**: Use `@/` path aliases (see tsconfig paths). Never use relative paths for shared modules.
- **Feature-first**: New features go in `src/features/<name>/`; shared code in `src/shared/`.
- **Index exports**: Every feature/service has `index.ts` that re-exports all public members.
- **ESLint**: `eslint-config-expo/flat`; `dist/*` ignored.
- **TypeScript strict mode** enabled.
- **Package manager**: Use `pnpm` (both `package-lock.json` and `pnpm-lock.yaml` exist — avoid drift).
- **Expo docs**: Use official LLM docs at `docs.expo.dev/llms.txt` (enforced by `.agents/rules/expo.md`).

---

## PROJECT-SPECIFIC BEHAVIOR

- Tab bar is **hidden** (`tabBarStyle: { display: 'none' }`) but tabs still work as route groups for navigation structure.
- `unstable_settings.anchor: "(tabs)"` in root layout sets default navigation anchor.
- `OfflineBanner` renders at root level when `isOnline === false` via `useNetwork()` hook.
- `@gorhom/bottom-sheet` used for: sheets, modals, filters, action menus. Most sheets use `BottomSheetModal` with `BottomSheetBackdrop`.
- Camera capture flow: `camera-capture` → `capture-review` → `processing` → `document/[id]`

---

## COMMANDS

```bash
pnpm install
pnpm run start        # Dev server
pnpm run android      # Android
pnpm run ios          # iOS
pnpm run web          # Web
pnpm run lint         # ESLint
pnpm run reset-project  # Move app/ → app-example/, reset to blank
```

---

## NOTES

- No test runner configured (`package.json` has no test script).
- No CI workflow in this frontend directory.
- Design reference: `DESIGN.md` at repo root (parent of frontend/).
- API contract: `docs/openapi.json` (OpenAPI 3.x spec for backend).
- Backend integration: `docs/BACKEND-INTEGRATION.md` has full setup guide.

---

## PROJECT LEARNINGS

### Navigation & Auth
- Auth toggle buttons use `router.replace(...)` not `router.push(...)`. Prevents stacking on spam-tap.
- Expo Router root `Stack` needs `headerShown: false` for `"(auth)"` even when nested layout also hides headers.
- Route names must match actual route entries. `"(auth)"` valid only when nested group layout exists.
- `unstable_settings.anchor: "(tabs)"` sets default route after splash.

### Bottom Sheet (@gorhom)
- `BottomSheet` → **default import only**. Named import crashes.
- Use plain `BottomSheet` for landing page (app/index.tsx). `BottomSheetModal` for global sheets.
- Most sheets use `BottomSheetModal` with `BottomSheetBackdrop`, `BottomSheetScrollView`, `BottomSheetView`.
- `index` prop = initial snap position. After mount, use imperative methods: `snapToIndex(0)`, `close()`.
- Animation fails on return? Use focus-based handling (`useIsFocused`) over mount-only logic. Expo Router can restore screen without remounting.

### Auth Transitions
- Custom slide+fade transitions use `slideFade()`, `forSlideFadeFromLeft()`, `forSlideFadeFromRight()` in auth flow.
- Centralize animation behavior in `app/(auth)/_layout.tsx`, not per-screen.

### Dependencies
- `lightningcss` **must** stay pinned to `1.30.1` in both `overrides` and `pnpm.overrides`. Drift breaks NativeWind.
- `pnpm` is preferred package manager for all changes.

### Error Handling
- `parseApiError()` is the central error parser. It maps HTTP status codes to `AppErrorCode` types.
- Used by `handleContinueToProcessing()` (upload) and `useErrorToast()` (global).
- Error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `NETWORK_ERROR`, `UNKNOWN_ERROR`, `INTERNAL_SERVER_ERROR`.

### graphify (Knowledge Graph)
- Graph at `graphify-out/` with 271 nodes, 12 communities.
- **READ `graphify-out/GRAPH_REPORT.md` before architecture questions.**
- Use `graphify query "<question>"`, `graphify path "<A>" "<B>"`, `graphify explain "<concept>"` for cross-module relationships.
- God node `parseApiError()` bridges Community 3 (error handling) with other communities.
- Exclude `dist-web-check/` and `dist-tailwind-check/` from analysis (noisy single-letter nodes).
- Run `graphify update .` after code changes (AST-only, no API cost).

### Whitelist System
- `applyWhitelistToDocument()`, `loadWhitelistMap()`, `persistDocumentWhitelist()` handle access control.
- `AccessWhitelistCard` displays whitelist UI on document detail.
- Whitelist grants stored in secure storage, hydrated on app load.

### Web Layer
- `app/_layout.web.tsx` is the web root. It only allows `/`, `/admin`, `/public` — everything else redirects to `/`.
- All native-only routes have `.web.tsx` stubs that render `WebHomeRedirect` (redirects to `/`).
- `WebsiteLandingScreen` is the marketing landing page rendered at `/` on web.
- `WebHomeRedirect` uses `window.location.replace('/')` on web and `router.replace('/')` as fallback.
- Web-allowed paths: `/` (landing), `/admin/*` (admin panel), `/public/*` (public verifier).

### Public Verification Feature
- Two separate flows: PDF upload (`/public/verify`) and code-based (`/public/verify/[code]`).
- PDF upload uses `PublicVerifierDom` (`"use dom"` component) → `publicApi.verifyDocument` → `POST /public/verify`.
- Code-based lookup: backend endpoint `GET /public/verify/{code}` does **not exist yet**. `verifyDocumentByCode` throws `NOT_IMPLEMENTED` until backend is ready.
- `PublicVerifyResponse` (from schema) has: `status`, `confidence`, `file_name`, `notarized_at`, `notarized_by`, `tx_hash`, `matched_at`.
- `PublicVerificationResult` (code-based type) has: `verification_code`, `status`, `file_name`, `document_hash`, `uploaded_at`, `verified_at`, `owner_display_name`, `message`. These are **different shapes**.
- `PublicVerifierDom` file input: must add `onClick={(e) => e.stopPropagation()}` on the `<input>` to prevent click event bubbling back to the parent div, which would open the file dialog twice and cancel it.

### Admin Panel
- Full admin panel at `app/admin/` with protected routes under `app/admin/(protected)/`.
- Admin feature at `src/features/admin/` with screens, components, api, hooks, types.
- Admin routes: dashboard, documents, users, analytics, audit-logs, blockchain-records, categories, document-issuers, invitations-permissions, ocr-nlp-processing, system-settings, verification-logs.

### Query Layer
- `src/services/query/keys.ts` centralizes all React Query key factories — use it before defining inline keys.
- Separate query hooks per domain: `use-auth`, `use-documents`, `use-admin`, `use-blockchain`, `use-public`, `use-users`.

### DOM Components (`"use dom"`)
- `PublicVerifierDom` uses `"use dom"` directive — runs as a webview on native, plain web on web.
- DOM components use plain HTML/CSS inline styles, not NativeWind or StyleSheet.
- Pass callbacks (like `verifyPdf`) as props from the Expo Router route into the DOM component.
- DOM component props must be serializable; use `dom?: import('expo/dom').DOMProps` for DOM-specific config.

---

## SKILL LOADING REMINDER

Before implementing a feature, check whether a relevant project skill or rule exists.

If the coding agent supports project skills, load the matching skill before implementation.
If the coding agent does not support a `skill()` tool, manually read the matching `.agents/skills/<skill>/` documentation before making changes.

Prefer project-local skills and rules over generic advice.

| Task | Skill / Doc to Check |
|------|----------------------|
| Expo rules, routing, CLI, SDK behavior | `.agents/rules/expo.md` |
| UI components, animations, layout, styling | `.agents/skills/building-native-ui/` |
| API calls, React Query, fetch patterns | `.agents/skills/native-data-fetching/` |
| NativeWind, Tailwind, CSS setup | `.agents/skills/expo-tailwind-setup/` |
| Deployment, App Store, Play Store | `.agents/skills/expo-deployment/` |
| CI/CD and EAS builds | `.agents/skills/expo-cicd-workflows/` |
| Expo SDK upgrades | `.agents/skills/upgrading-expo/` |
| Native module work | `.agents/skills/expo-module/` |
| Development client builds | `.agents/skills/expo-dev-client/` |
| UI/UX design decisions | `.agents/skills/ui-ux-pro-max/` |
| After React-heavy changes | `/react-doctor` if available |

Do not import files from `.agents/` or `.agent/` into runtime application code.

---

## Software Engineering Principles

- **Readability first**: Choose readable, maintainable code over clever tricks.
- **KISS**: Pick the simplest solution that fully solves the task.
- **DRY carefully**: Extract repeated logic only when reuse is clear and proven.
- **YAGNI**: Build only what is required right now. Avoid speculative complexity.
- **Single responsibility**: Each function, component, hook, service, or module should have one clear purpose.
- **Separate concerns**: Keep UI, domain logic, navigation, and API/data access distinct.
- **Consistency over new abstractions**: Follow existing project patterns before introducing new ones.
- **Composition over inheritance**: Prefer small reusable components and hooks over tightly coupled structures.
- **Minimize blast radius**: Make the smallest safe change that preserves existing behavior.
- **Reuse before create**: Use existing components, hooks, services, theme tokens, constants, and utilities before adding new ones.
- **No unjustified dependencies**: Do not add libraries, indirection, config, or architecture unless the current stack cannot reasonably solve the problem.
- **Prefer explicit code over magic**: Avoid hidden side effects and unclear abstractions.
- **Optimize only when needed**: Do not prematurely optimize, but avoid obviously inefficient patterns.

### Do

- Do write code that a student teammate can understand later.
- Do keep files focused and easy to scan.
- Do reuse existing app patterns before inventing a new one.
- Do explain major tradeoffs in comments only when the code is not self-explanatory.
- Do make small, reviewable changes.
- Do prefer boring, predictable code over clever code.

### Don't

- Don't rewrite a whole feature just to change one behavior.
- Don't create generic abstractions for one-time use.
- Don't add libraries for simple helpers, formatting, or small UI behavior.
- Don't hide important logic inside overly clever utilities.
- Don't change unrelated files just for style preference.
- Don't introduce architecture that the current feature does not need.

### Examples

#### KISS / Readability First

### Do:

```ts
export function formatDocumentCount(count: number): string {
  return `${count} ${count === 1 ? "document" : "documents"}`;
}
```

### Don't:
```ts
export const formatDocumentCount = (n: number) =>
  `${n} document${+(n !== 1) ? "s" : ""}`;
```

#### DRY, but do not over-abstract too early

### Do:

```tsx
<Button label="Upload document" onPress={handleUpload} />
<Button label="Cancel" variant="secondary" onPress={handleCancel} />
```

### Don't:
```tsx
const actions = [
  {
    id: "upload",
    label: "Upload document",
    behavior: "primary-action",
    interactionMode: "document-flow",
    handler: handleUpload,
  },
  {
    id: "cancel",
    label: "Cancel",
    behavior: "secondary-action",
    interactionMode: "document-flow",
    handler: handleCancel,
  },
];

actions.map((action) => (
  <DynamicActionRenderer
    key={action.id}
    action={action}
    renderStrategy="document-action-footer"
  />
));
```

#### Single Responsibility

### Do:

```ts
export function mapDocumentStatus(status: string): DocumentStatus {
  if (status === "verified") return "verified";
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";

  return "unknown";
}
```

### Don't:

```ts
export function mapDocumentStatusAndShowToastAndNavigate() {
  // Maps document status
  // Shows toast
  // Saves state
  // Navigates user
}
```

#### Minimize Blast Radius

### Do:

```ts
// Fix only the auth toggle behavior.
router.replace("/(auth)/sign-in");
```

### Don't:

```ts
// Do not rewrite the full auth navigation system just to prevent stacking.
createNewAuthNavigationFramework();
```

---

## Expo React Native + Web Rules

- Use TypeScript for all new code.
- Prefer functional components and hooks.
- Use Expo-supported APIs and libraries when possible.
- Use Expo Router patterns for navigation, layouts, route groups, redirects, and protected screens.
- Do not use outdated Expo advice such as `expo eject` or old "managed vs bare workflow" assumptions.
- Use `npx expo` commands instead of deprecated global `expo-cli`.
- Optimize for mobile-first layouts and interactions, while keeping web compatibility in mind.
- Prefer platform-appropriate UI and behavior. Do not force web-only patterns into native screens.
- Use `react-native` primitives unless the project already has a shared component for the same use case.
- Use `Pressable` or project Button components for touch-friendly interactions.
- Respect safe areas, keyboard behavior, status bars, and platform differences.
- Preserve accessibility, responsiveness, and performance in every change.
- Be careful with unnecessary effects, large lists, excessive re-renders, and inline heavy computations.
- Prefer `FlatList`, `SectionList`, or an existing optimized list component for large collections.
- Keep state as local as possible. Lift or centralize it only when necessary.
- Keep business logic out of presentational components.
- Extract reusable logic into hooks only when it is reused or clearly improves clarity.
- Prefer feature-based organization for growing app areas.
- Reuse existing components, hooks, services, utilities, theme tokens, and constants before creating new ones.
- Keep styling consistent with the existing theme/design system.
- Do not introduce native modules, config plugins, or prebuild-related changes unless explicitly required.

### Do

```tsx
import { ActivityIndicator } from "react-native";

import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { useCurrentUser } from "@/services/query/use-auth";

export function ProfileSummary() {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError) {
    return (
      <ThemedView>
        <ThemedText>Unable to load profile.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <ThemedText>{user?.name}</ThemedText>
    </ThemedView>
  );
}
```

### Don't

```tsx
// Bad: raw fetch, untyped data, and plain text/view primitives for routine themed UI.
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export function ProfileSummary() {
  const [data, setData] = useState<any>();

  useEffect(() => {
    fetch("https://api.example.com/profile")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  return (
    <View>
      <Text>{data?.user?.profile?.name}</Text>
    </View>
  );
}
```

---

## Frontend / API Client Rules

This repository is a frontend Expo app. It may call backend endpoints through an API client, but it should not implement backend responsibilities.

- Keep all network requests inside API/client/service modules in `src/services/api/`.
- Screens and UI components should not call `fetch` directly unless no API layer exists yet.
- Use React Query hooks from `src/services/query/` for server state when available.
- Use typed request and response shapes. Check `src/types/` and existing API modules before creating new types.
- Keep API base URLs and environment-specific values in the existing config/env pattern in `src/shared/config/`.
- Do not hardcode production URLs inside components.
- Handle loading, empty, success, and error states in UI.
- Prefer existing `QueryStates`, `OfflineBanner`, and error utilities where applicable.
- Use `parseApiError()` from `src/shared/utils/api-error.ts` for API error normalization.
- Do not store secrets, private keys, service-role keys, or backend credentials in the frontend.
- Do not implement backend-only validation, authorization, or database logic in the app.
- Do client-side validation only for user experience. The backend remains the source of truth.
- Keep mock/demo data clearly separated from real API calls.
- When backend is not ready, use mock services or adapters that can be replaced later without rewriting screens.

### Do

```ts
// src/services/api/auth.api.ts
import { apiClient } from "./client";
import type { LoginRequest, LoginResponse } from "@/types";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login", payload);
}

// src/services/query/use-auth.ts
import { useMutation } from "@tanstack/react-query";

import { login } from "@/services/api/auth.api";

export function useSignIn() {
  return useMutation({
    mutationFn: login,
  });
}

// Good: screen uses a query/mutation hook instead of raw fetch.
const signInMutation = useSignIn();

await signInMutation.mutateAsync({
  email,
  password,
});
```

### Don't

```ts
// Bad: hardcoded URL, untyped response, raw fetch inside screen.
const response = await fetch("https://production-api.com/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
// Bad: frontend pretending to be backend.
const ADMIN_SECRET = "secret-key";
```

---

## Component Rules

- Presentational components should receive data through props.
- Avoid components that both fetch data and render complex UI unless the pattern already exists.
- Keep reusable components flexible but not overly generic.
- Prefer clear prop names over vague names like `data`, `item`, or `config` when possible.
- Use composition for complex UI instead of adding too many boolean props.
- Keep screen-specific components near the feature/screen unless they are reused elsewhere.
- Move shared components only when reuse is real.
- Prefer existing project primitives such as `ThemedText`, `ThemedView`, `Button`, `IconSymbol`, and `QueryStates`.
- Do not bypass themed primitives for routine text and container UI.

### Do

```tsx
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";

type DocumentStatusCardProps = {
  title: string;
  statusLabel: string;
  caption?: string;
};

export function DocumentStatusCard({
  title,
  statusLabel,
  caption,
}: DocumentStatusCardProps) {
  return (
    <ThemedView className="rounded-2xl p-4">
      <ThemedText className="text-base font-semibold">{title}</ThemedText>
      <ThemedText className="mt-1 text-sm">{statusLabel}</ThemedText>
      {caption ? (
        <ThemedText className="mt-2 text-xs opacity-70">{caption}</ThemedText>
      ) : null}
    </ThemedView>
  );
}
```

### Don't

```tsx
// Bad: too many flags make the component unclear and hard to maintain.
<UniversalCard
  type="document"
  showStatus
  showCaption
  enableHeroMode
  useDashboardLayout
  variant="special"
  hasVerificationMode
  shouldRenderActions
/>
```

---

## Styling and UI Rules

- Follow the existing design system, theme file `src/shared/theme/theme.ts`, color tokens, spacing, typography, and component patterns.
- This project uses NativeWind v5 + Tailwind v4 through `@/tw`.
- Prefer existing theme tokens and shared primitives before one-off styles.
- Do not introduce a new styling approach unless explicitly requested.
- Use responsive layout patterns that work on native and web.
- Design mobile-first, then adapt for larger screens.
- Respect safe areas on screens.
- Avoid fixed heights that break on small devices unless required.
- Use touch-friendly sizes for buttons, inputs, and interactive elements.
- Keep visual polish consistent across screens.
- Use `StyleSheet.create(...)` only when NativeWind is awkward, unsupported, or less readable.

### Do

```tsx
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";

export function WelcomeHeader() {
  return (
    <ThemedView className="px-5 py-6">
      <ThemedText className="text-2xl font-bold">
        Welcome back
      </ThemedText>
      <ThemedText className="mt-2 text-sm opacity-70">
        Manage and verify your documents.
      </ThemedText>
    </ThemedView>
  );
}
```

### Also acceptable when needed

```tsx
import { StyleSheet, View } from "react-native";

export function AbsoluteOverlay() {
  return <View pointerEvents="none" style={styles.overlay} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
```

### Don't

```tsx
// Bad: random one-off values that ignore the app theme and may break on small devices.
<View style={{ padding: 13, backgroundColor: "#123abc", height: 812 }}>
```

---

## Navigation Rules

- Follow Expo Router file-based routing conventions.
- Use route groups and layout files consistently with the existing app structure.
- Do not navigate by pushing duplicate auth screens when a redirect or replace is more appropriate.
- Use `router.replace(...)` for auth transitions where the user should not go back to the previous auth screen.
- Use `router.push(...)` only when the previous screen should remain in history.
- Keep navigation logic out of deeply nested presentational components when possible.
- Do not create custom navigation systems if Expo Router already solves the problem.
- Do not add parallel navigation abstractions outside Expo Router route files.
- Route names must match actual files and route groups in `app/`.

### Do

```ts
import { router } from "expo-router";

// Auth toggle: prevents stacking sign-in/sign-up screens.
router.replace("/(auth)/sign-in");
```

```ts
import { router } from "expo-router";

// Detail navigation: previous screen should remain in history.
router.push(`/document/${documentId}`);
```

### Don't

```ts
// Bad for auth redirect because it can stack screens repeatedly.
router.push("/sign-in");
router.push("/sign-in");
router.push("/sign-in");
```

```ts
// Bad: do not create another router abstraction for an Expo Router app.
customNavigationService.navigate("SignIn");
```

---

## Change Rules

- Prefer small diffs over broad rewrites.
- Do not refactor unrelated code.
- Preserve existing behavior unless the task explicitly requires a behavior change.
- When editing a feature, follow nearby patterns first.
- Do not introduce new libraries if the current stack already solves the problem.
- Ask for confirmation before major architectural changes.
- Do not rename files, routes, folders, or public APIs unless required.
- Do not change formatting across unrelated files.
- Do not remove comments, TODOs, or existing behavior without understanding why they exist.
- Keep generated code aligned with the current repository structure.
- Update exports from `index.ts` files when adding public feature/service members.
- Avoid touching god nodes such as `parseApiError()` or `request()` unless the task requires it.
- If a change touches API behavior, check `docs/openapi.json` and existing API modules first.
- If a change touches navigation, check `app/_layout.tsx`, route groups, and existing route names first.

### Do

- Do fix the requested screen or feature directly.
- Do keep existing naming and folder conventions.
- Do mention when a requested change may affect navigation, storage, API contracts, or app config.
- Do keep package manager usage consistent with `pnpm`.
- Do preserve the pinned `lightningcss` version unless explicitly asked to fix that dependency issue.

### Don't

- Don't redesign the entire app when asked to fix one component.
- Don't move files into a new architecture without approval.
- Don't install a new state manager for one shared value.
- Don't replace working code just because another pattern is popular.
- Don't modify lockfiles with a different package manager.
- Don't import `.agents/` or `.agent/` files into runtime code.

---

## BEFORE EDITING

Before changing code:

- Identify the smallest set of files needed for the task.
- Check nearby files for existing patterns.
- Check whether a shared component, hook, API function, type, or utility already exists.
- Check route names before editing navigation.
- Check `docs/openapi.json` before changing API calls.
- Check `graphify-out/GRAPH_REPORT.md` for god nodes — avoid modifying them unless required.
- Check relevant skill docs (e.g., `/native-data-fetching`, `/building-native-ui`) before data or UI work.

---

## AFTER EDITING

After changing code:

- Run `pnpm run lint` when practical.
- Check TypeScript errors in touched files.
- Confirm imports use project aliases (`@/features/*`, `@/ui`, `@/shared/*`) where appropriate.
- Confirm no raw `fetch` was added inside screens or components.
- Confirm no `.agents/` or `.agent/` files were imported into runtime code.
- Confirm `lightningcss` stayed pinned to `1.30.1`.
- Confirm no `@gorhom/bottom-sheet` named imports (must use default import for `BottomSheet`).
- Mention any behavior change, API contract assumption, or untested area in the final response.

---

## SECURITY RULES

This app handles document verification, whitelist access, and auth tokens. Rules:

- Never store secrets, private keys, service-role keys, or backend credentials in frontend code.
- Never log auth tokens, private document data, verification keys, or sensitive API responses.
- Treat client-side checks as UX only. Backend authorization remains the source of truth.
- Keep secure storage access centralized in `src/shared/utils/secure-storage.ts`.
- Do not weaken document verification, whitelist, or auth flows without explicit approval.
