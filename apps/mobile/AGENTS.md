# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Commit:** 5714b5e
**Branch:** lexchain-web/dev
**Expo SDK:** 54.0.34 | React Native: 0.81.5 | React: 19.1.0

---

## OVERVIEW

Expo Router mobile app for LexChain document management. Features: upload documents, AI-powered processing, native document verification with ECC cryptography, access whitelisting, and user profiles. Browser landing/admin/public verifier now live in `../web/`.

**Backend expects:** Python/FastAPI (root contract at `../../openapi-updated.json`; local example contract at `openapi-with-examples.json`).

---

## STRUCTURE (VERIFIED)

```text
apps/mobile/
├── app/                          # Expo Router route tree + layouts
│   ├── _layout.tsx               # Native root layout (Stack + all providers)
│   ├── index.tsx                 # Native landing + BottomSheet
│   ├── modal.tsx                 # Modal presentation
│   ├── upload.tsx                # Upload flow (native)
│   ├── camera-capture.tsx        # Camera capture (native)
│   ├── capture-review.tsx        # Review captured images (native)
│   ├── processing.tsx            # AI processing screen (native)
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
│   │   ├── documents.tsx         # Documents tab (native)
│   │   └── profile.tsx           # Profile tab (native)
│   ├── document/
│   │   ├── [id].tsx              # Document detail route (native)
│   │   └── pdf-viewer.tsx        # In-app PDF viewer (native)
│   ├── verify/
│   │   └── [id].tsx              # Document verification (native)
│   ├── profile/
│   │   ├── account.tsx
│   │   ├── notifications.tsx
│   │   ├── security.tsx
│   │   ├── privacy.tsx
│   │   └── support.tsx
├── src/
│   ├── features/                 # Feature modules
│   │   ├── auth/                 # Auth components + Zod schemas + OAuth callback
│   │   │   ├── callback/         # auth-callback-screen.tsx, auth-callback.params.ts
│   │   │   ├── hooks/            # sign-up screen and terms sheet hooks
│   │   │   ├── schemas/          # sign-in.schema.ts, sign-up.schema.ts
│   │   │   ├── screens/          # sign-in, sign-up, forgot-password screens/styles
│   │   │   └── utils/            # password-strength helpers
│   │   ├── dashboard/            # Home KPI cards + recent list
│   │   ├── document/             # Document detail components + services
│   │   │   ├── components/       # Ask sheet, detail cards, menu, PDF viewer, verification, whitelist UI
│   │   │   ├── constants/        # document details and whitelist constants
│   │   │   ├── hooks/            # detail sheets, PDF, rename, whitelist, version update hooks
│   │   │   ├── screens/          # detail, menu, PDF viewer screens
│   │   │   ├── services/         # whitelist-mappers, whitelist-storage, document-permissions
│   │   │   ├── types/            # document detail/ask section types
│   │   │   └── utils/            # mappers, formatters, document file helpers
│   │   ├── documents/            # Document list/search/filter
│   │   │   ├── components/       # list, filter, sort, search result UI
│   │   │   ├── constants/        # screen constants
│   │   │   ├── data/             # mock document list data
│   │   │   ├── hooks/            # screen/search/filter sheet hooks
│   │   │   ├── screens/          # documents screen
│   │   │   ├── types/            # documents screen types
│   │   │   └── utils/            # list mappers and filters
│   │   ├── onboarding/           # GetStartedHero
│   │   │   └── screens/          # get started screen/styles
│   │   ├── profile/              # Profile screens + settings
│   │   │   └── screens/          # account, notifications, privacy, security, support, profile
│   │   ├── upload/               # Upload session, type picker, dropzone, camera/review/processing
│   │   │   ├── components/       # camera, capture-review, dropzone, form, processing UI
│   │   │   ├── constants/        # processing constants
│   │   │   ├── hooks/            # upload, capture, processing hooks
│   │   │   ├── screens/          # upload, camera capture, capture review, processing
│   │   │   ├── types/            # camera capture types
│   │   │   └── utils/            # upload/camera/processing utilities
│   │   └── verification/         # Native verifier screen and formatters
│   ├── shared/
│   │   ├── components/           # Primitives (ThemedText, Screen, etc.)
│   │   │   └── ui/               # Button, IconSymbol, QueryStates, OfflineBanner, etc.
│   │   ├── hooks/                # useThemeColor, useColorScheme, useNetwork, etc.
│   │   ├── providers/            # queryClient singleton
│   │   ├── theme/                # Colors, Fonts, APP_COLORS
│   │   ├── utils/                # api-error parser, secure-storage, tw utilities
│   │   └── config/               # Environment config (env.ts)
│   ├── services/
│   │   ├── api/                  # API modules + OpenAPI client
│   │   │   ├── client.ts         # Base request wrapper with auth interceptors
│   │   │   ├── auth.api.ts
│   │   │   ├── documents.api.ts
│   │   │   ├── public.api.ts     # POST /public/verify (file upload)
│   │   │   ├── admin.api.ts
│   │   │   ├── blockchain.api.ts
│   │   │   ├── openapi-client.ts
│   │   │   ├── users.api.ts
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
│   ├── constants/                # storage-keys constants
│   ├── tw/                       # NativeWind/Tailwind utilities
│   └── global.css                # NativeWind/Tailwind global CSS
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
│   │   ├── react-doctor/
│   │   ├── ui-ux-pro-max/
│   │   ├── upgrading-expo/
│   │   └── use-dom/
│   └── plugins/marketplace.json
├── .agent/                       # User-level agent config (mirrors .agents)
│   ├── AGENTS.md
│   ├── rules/expo.md
│   └── skills/
├── android/                      # Native Android project files
├── ios/                          # Native iOS project files
├── graphify-out/                 # Local graphify cache/chunks (GRAPH_REPORT.md may be absent)
├── dist*/                        # Generated local check/build output; do not treat as source
├── scripts/                      # reset-project helper
├── docs/                         # Design docs, TODOs, integration notes
│   ├── expo-llms/                # Cached Expo LLM docs (llms.txt, llms-sdk.txt, llms-eas.txt)
│   └── BACKEND-INTEGRATION.md
├── assets/images/                # Static images and icons
├── app.json                      # Expo app config
├── eas.json                      # EAS build config
├── metro.config.js               # Metro config
├── postcss.config.mjs            # PostCSS/Tailwind config
├── openapi-with-examples.json    # Local OpenAPI example contract
└── package.json                  # @lexchain/mobile scripts/dependencies
```

---

## MANDATORY READING ORDER

### When starting a session or receiving a task:

1. **FIRST:** Read `.agents/rules/expo.md` (or `.agent/rules/expo.md`) — enforces Expo LLM docs usage.
2. **THEN:** Check `AGENTS.md` (this file) for project-level conventions.
3. **THEN:** Check `graphify-out/GRAPH_REPORT.md` for god nodes and community structure when it exists; current checkout may only have `cache/` and `chunks/`.
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
- Root `../../pnpm-lock.yaml` is the lockfile. Use `pnpm` for all changes; do not introduce npm/yarn lockfiles.

### lightningcss Version
- **Must stay pinned to `1.30.1`** in mobile `devDependencies` and root `pnpm.overrides`. Drift to `1.32.0` breaks NativeWind bundling with `failed to deserialize; expected an object-like struct named Specifier`.

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
| Public verifier (web) | `../web/app/verify/` | Next.js owns public verification |
| Admin panel (web) | `../web/app/admin/` | Next.js owns admin routes |
| Website landing (web) | `../web/app/page.tsx` | Next.js owns marketing page |
| API client | `src/services/api/client.ts` | Base request wrapper with interceptors |
| Auth API | `src/services/api/auth.api.ts` | Login, logout, register, verify |
| Documents API | `src/services/api/documents.api.ts` | CRUD, search, whitelist |
| Public API | `src/services/api/public.api.ts` | `POST /public/verify` (file upload, no auth) |
| Admin API | `src/services/api/admin.api.ts` | Admin CRUD operations |
| Blockchain API | `src/services/api/blockchain.api.ts` | Notarize + on-chain verify |
| Generated schema | `../../packages/types/src/generated/schema.ts` | Auto-generated from `../../openapi-updated.json` |
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
| API contract | `../../openapi-updated.json` | Root backend OpenAPI 3.x contract |
| Local API examples | `openapi-with-examples.json` | Mobile-local example OpenAPI contract |
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
- **Package manager**: Use `pnpm`; root lockfile is `../../pnpm-lock.yaml`.
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
- API contract: `../../openapi-updated.json` (OpenAPI 3.x spec for backend); local examples live in `openapi-with-examples.json`.
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
- `lightningcss` **must** stay pinned to `1.30.1` in mobile `devDependencies` and root `pnpm.overrides`. Drift breaks NativeWind.
- `pnpm` is preferred package manager for all changes.

### Error Handling
- `parseApiError()` is the central error parser. It maps HTTP status codes to `AppErrorCode` types.
- Used by `handleContinueToProcessing()` (upload) and `useErrorToast()` (global).
- Error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `NETWORK_ERROR`, `UNKNOWN_ERROR`, `INTERNAL_SERVER_ERROR`.

### graphify (Knowledge Graph)
- `graphify-out/` currently contains local cache/chunks; `GRAPH_REPORT.md` may be absent in this checkout.
- If `graphify-out/GRAPH_REPORT.md` exists, read it before architecture questions.
- Use `graphify query "<question>"`, `graphify path "<A>" "<B>"`, `graphify explain "<concept>"` for cross-module relationships when graph data is available.
- Known high-risk nodes from prior reports include `parseApiError()` and `request()`.
- Exclude `dist-web-check/`, `dist-tailwind-check/`, and other `dist*/` outputs from analysis.
- Run `graphify update .` after code changes when graphify output must stay current (AST-only, no API cost).

### Whitelist System
- `applyWhitelistToDocument()`, `loadWhitelistMap()`, `persistDocumentWhitelist()` handle access control.
- `AccessWhitelistCard` displays whitelist UI on document detail.
- Whitelist grants stored in secure storage, hydrated on app load.

### Web Layer
- Expo is now mobile-focused. Next.js in `../web/` owns landing, admin, public verifier, invite fallback, download, terms, and privacy pages.
- Do not reintroduce Expo web-only landing/admin/public verifier routes unless there is a clear compatibility plan.

### Public Verification Feature
- Browser public verifier lives in `../web/app/verify/`.
- The live PDF upload flow posts through the Next.js route handler to backend `POST /public/verify`.
- Code-based lookup remains explicit about backend limitation if `GET /public/verify/{code}` is not implemented.

### Admin Panel
- Full web admin routes live in `../web/app/admin/`.
- Mobile should not import admin screens or React Native web-only admin feature code.

### Query Layer
- `src/services/query/keys.ts` centralizes all React Query key factories — use it before defining inline keys.
- Separate query hooks per domain: `use-auth`, `use-documents`, `use-admin`, `use-blockchain`, `use-public`, `use-users`.

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
- If a change touches API behavior, check `../../openapi-updated.json` and existing API modules first.
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
- Check `../../openapi-updated.json` before changing API calls.
- Check `graphify-out/GRAPH_REPORT.md` for god nodes when it exists — avoid modifying them unless required.
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
