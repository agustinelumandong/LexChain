# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-08T20:40:00+08:00
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
├── app/                    # Expo Router route tree + layouts
│   ├── (auth)/
│   │   ├── _layout.tsx    # Auth navigation wrapper
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx    # Bottom tabs (hidden, route groups only)
│   │   ├── index.tsx      # Home tab
│   │   ├── documents.tsx  # Documents tab
│   │   └── profile.tsx    # Profile tab
│   ├── admin/             # Admin panel (empty dir)
│   ├── document/[id].tsx  # Document detail route
│   ├── verify/[id].tsx    # Document verification
│   ├── index.tsx         # Landing + BottomSheet
│   ├── upload.tsx         # Upload flow
│   ├── camera-capture.tsx # Camera capture
│   ├── capture-review.tsx  # Review captured images
│   ├── processing.tsx     # AI processing screen
│   └── modal.tsx          # Modal presentation
├── src/
│   ├── features/          # Feature modules
│   │   ├── auth/          # Auth components + Zod schemas
│   │   ├── dashboard/     # Home KPI cards + recent list
│   │   ├── document/      # Document detail components
│   │   ├── documents/     # Document list/search/filter
│   │   ├── onboarding/    # GetStartedHero
│   │   ├── profile/       # Profile screens + settings
│   │   └── upload/        # Upload session, type picker
│   ├── shared/
│   │   ├── components/    # Primitives (ThemedText, Screen, etc.)
│   │   │   └── ui/        # Button, IconSymbol, QueryStates, etc.
│   │   ├── hooks/        # useThemeColor, useColorScheme, useNetwork, etc.
│   │   ├── providers/    # queryClient singleton
│   │   ├── theme/        # Colors, Fonts, APP_COLORS
│   │   ├── utils/        # api-error parser, secure-storage, tw utilities
│   │   └── config/       # Environment config
│   ├── services/
│   │   ├── api/          # auth.api.ts, documents.api.ts, client.ts
│   │   └── query/        # React Query hooks (use-auth.ts, use-documents.ts)
│   ├── types/            # auth.types, document.types, upload.types
│   ├── mocks/            # Mock data (dev mode)
│   ├── constants/         # storage-keys constants
│   └── tw/               # NativeWind/Tailwind utilities
├── .agents/              # LOCAL AGENT SKILLS (do not import in runtime code)
│   ├── AGENTS.md         # This file's sibling scope doc
│   ├── rules/
│   │   └── expo.md       # Expo project rule — READ THIS FIRST
│   ├── skills/
│   │   ├── building-native-ui/  # Expo UI patterns + references
│   │   ├── expo-api-routes/       # EAS Hosting API routes
│   │   ├── expo-cicd-workflows/  # EAS build/deploy workflows
│   │   ├── expo-deployment/      # App Store + Play Store deployment
│   │   ├── expo-dev-client/       # Dev client builds
│   │   ├── expo-module/          # Native module writing
│   │   ├── expo-tailwind-setup/  # NativeWind setup
│   │   ├── expo-ui-jetpack-compose/  # Jetpack Compose in Expo
│   │   ├── expo-ui-swiftui/          # SwiftUI in Expo
│   │   ├── native-data-fetching/    # Data fetching patterns
│   │   ├── ui-ux-pro-max/           # UI/UX design intelligence
│   │   ├── upgrading-expo/           # Expo SDK upgrades
│   │   └── use-dom/                 # DOM components in Expo
│   └── plugins/marketplace.json
├── .agent/              # User-level agent config (mirrors .agents)
│   ├── rules/expo.md   # Same expo rule (user global)
│   └── skills/         # User-installed skills (many more)
├── graphify-out/       # Knowledge graph output
├── docs/               # Design docs, TODOs, integration notes
└── assets/images/      # Static images
```

---

## MANDATORY READING ORDER

### When starting a session or receiving a task:

1. **FIRST:** Read `.agents/rules/expo.md` (or `.agent/rules/expo.md`) — enforces Expo LLM docs usage.
2. **THEN:** Check `AGENTS.md` (this file) for project-level conventions.
3. **THEN:** Check `graphify-out/GRAPH_REPORT.md` for god nodes and community structure (for architecture questions).

### Skill Loading:

**ALWAYS check for available skills before implementing.** When a task matches a skill description, use the `skill()` tool to load it.

**Available skills for this project:**
| Skill | When to use |
|-------|------------|
| `/building-native-ui` | UI components, animations, navigation, styling |
| `/native-data-fetching` | API calls, React Query, fetch patterns |
| `/expo-tailwind-setup` | NativeWind, Tailwind, CSS setup |
| `/expo-deployment` | iOS/Android deployment |
| `/expo-cicd-workflows` | EAS builds, CI/CD |
| `/expo-dev-client` | Dev client builds |
| `/expo-module` | Native module writing |
| `/ui-ux-pro-max` | UI/UX design decisions |
| `/upgrading-expo` | SDK upgrades |
| `/react-doctor` | After React changes (catch issues early) |

---

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| App entry | `package.json` (`main: "expo-router/entry"`) | Expo Router auto-discovery |
| Root layout | `app/_layout.tsx` | Stack navigator + all providers |
| Tab layout | `app/(tabs)/_layout.tsx` | Tabs hidden, used as route groups |
| Auth screens | `app/(auth)/` + `src/features/auth/` | Sign-in, sign-up, forgot password |
| Auth schemas | `src/features/auth/schemas/` | Zod schemas (sign-up, sign-in) |
| Upload flow | `app/upload.tsx` + `src/features/upload/` | Full upload session |
| Camera capture | `app/camera-capture.tsx` → `capture-review.tsx` → `processing.tsx` | Multi-step capture |
| Document detail | `app/document/[id].tsx` + `src/features/document/` | Detail view + sheets |
| Document list | `app/(tabs)/documents.tsx` + `src/features/documents/` | Search, filter, sort sheets |
| Profile | `app/(tabs)/profile.tsx` + `src/features/profile/` | Profile + settings |
| API client | `src/services/api/client.ts` | Base request wrapper with interceptors |
| Auth API | `src/services/api/auth.api.ts` | Login, logout, register, verify |
| Documents API | `src/services/api/documents.api.ts` | CRUD, search, whitelist |
| Auth hooks | `src/services/query/use-auth.ts` | useSignIn, useSignUp, useResendVerification |
| Doc hooks | `src/services/query/use-documents.ts` | useDocuments, useDocument, useGlobalSearch, etc. |
| Query client | `src/shared/providers/query-client.ts` | Singleton QueryClient + focus listener |
| Theme tokens | `src/shared/theme/theme.ts` | Colors (light/dark), Fonts, APP_COLORS |
| UI primitives | `src/shared/components/ui/` | Button, IconSymbol, QueryStates, OfflineBanner, etc. |
| Shared hooks | `src/shared/hooks/index.ts` | useThemeColor, useColorScheme, useNetwork, etc. |
| Error handling | `src/shared/utils/api-error.ts` | parseApiError() — the god node |
| Secure storage | `src/shared/utils/secure-storage.ts` | Auth token persistence |
| Types | `src/types/index.ts` | auth, document, upload type exports |
| Path aliases | `tsconfig.json` | `@/`, `@/ui`, `@/theme`, `@/hooks`, `@/types`, etc. |
| API contract | `docs/openapi.json` | Backend API specification |
| Design files | `docs/` | Figma exports, TODO lists, integration docs |
| Auth toggle | Auth screens → `router.replace(...)` NOT `router.push(...)` | Prevents screen stacking |

---

## CODE MAP (From graphify - God Nodes)

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

## ANTI-PATTERNS (THIS PROJECT)

### BottomSheet Import
- **Must use `default` import** from `@gorhom/bottom-sheet`. Named import causes `Element type is invalid` error.
  ```tsx
  // ✅ Correct
  import BottomSheet from '@gorhom/bottom-sheet';
  import { BottomSheetModal, BottomSheetBackdrop, ... } from '@gorhom/bottom-sheet';

  // ❌ Wrong — will crash
  import { BottomSheet } from '@gorhom/bottom-sheet';
  ```

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

## UNIQUE STYLES

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

---

## SKILL LOADING REMINDER

**Before implementing ANY feature, ALWAYS check if a relevant skill exists.** Use the `skill()` tool:

| Task | Skill to Load |
|------|---------------|
| UI components, animations | `/building-native-ui` |
| API calls, data fetching | `/native-data-fetching` |
| Styling, NativeWind, Tailwind | `/expo-tailwind-setup` |
| Deployment (App Store, Play Store) | `/expo-deployment` |
| CI/CD, EAS builds | `/expo-cicd-workflows` |
| Expo SDK upgrade | `/upgrading-expo` |
| Native modules | `/expo-module` |
| Dev client builds | `/expo-dev-client` |
| UI/UX design decisions | `/ui-ux-pro-max` |
| After React changes | `/react-doctor` (opencode built-in) |

Check the skill list at the top of this file for the complete set. User-installed skills override built-ins — always prefer project skills when domain matches.

---

## Software Engineering Principles

- **Readability first**: Choose readable, maintainable code over clever tricks.
- **KISS**: Pick the simplest solution that fully solves the task.
- **DRY carefully**: Extract repeated logic only when reuse is clear and proven.
- **YAGNI**: Build only what is required right now — avoid speculative complexity.
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

### Don't

- Don't rewrite a whole feature just to change one behavior.
- Don't create generic abstractions for one-time use.
- Don't add libraries for simple helpers, formatting, or small UI behavior.
- Don't hide important logic inside overly clever utilities.
- Don't change unrelated files just for style preference.

---

## Expo React Native + Web Rules

- Use TypeScript for all new code.
- Prefer functional components and hooks.
- Use Expo-supported APIs and libraries when possible.
- Use Expo Router patterns for navigation, layouts, route groups, redirects, and protected screens.
- Do not use outdated Expo advice such as `expo eject` or old "managed vs bare workflow" assumptions.
- Use `npx expo` commands instead of deprecated global `expo-cli`.
- Optimize for mobile-first layouts and interactions, while keeping web compatibility in mind.
- Prefer platform-appropriate UI and behavior; do not force web-only patterns into native screens.
- Use `react-native` primitives unless the project already uses a UI library.
- Use `Pressable`/touch-friendly components for interactive UI.
- Respect safe areas, keyboard behavior, status bars, and platform differences.
- Preserve accessibility, responsiveness, and performance in every change.
- Be careful with unnecessary effects, large lists, excessive re-renders, and inline heavy computations.
- Prefer `FlatList`, `SectionList`, or an existing optimized list component for large collections.
- Keep state as local as possible; lift or centralize it only when necessary.
- Keep business logic out of presentational components.
- Extract reusable logic into hooks only when it is reused or clearly improves clarity.
- Prefer feature-based organization for growing app areas.
- Reuse existing components, hooks, services, utilities, theme tokens, and constants before creating new ones.
- Keep styling consistent with the existing theme/design system.
- Do not introduce native modules, config plugins, or prebuild-related changes unless explicitly required.

### Do

```tsx
// Good: screen uses a focused API function and keeps UI readable
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { authApi } from "@/services/api";

export function ProfileSummary() {
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const profile = await authApi.getCurrentUser();

        if (isMounted) {
          setName(profile.name);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>{name}</Text>
    </View>
  );
}
```

### Don't

```tsx
// Bad: API call, transformation, loading logic, and UI are all mixed casually
export function ProfileSummary() {
  const [data, setData] = useState<any>();

  useEffect(() => {
    fetch("https://api.example.com/profile")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  return <Text>{data?.user?.profile?.name}</Text>;
}
```

---

## Frontend / API Client Rules

This repository is a frontend Expo app. It may call backend endpoints through an API client, but it should not implement backend responsibilities.

- Keep all network requests inside API/client/service modules (`src/services/api/`).
- Screens and UI components should not call `fetch` directly unless no API layer exists yet.
- Use typed request and response shapes (see `src/services/api/` for examples).
- Keep API base URLs and environment-specific values in the existing config/env pattern (`src/shared/config/`).
- Do not hardcode production URLs inside components.
- Handle loading, empty, success, and error states in UI (use `QueryStates` component from `@/ui`).
- Do not store secrets, private keys, service-role keys, or backend credentials in the frontend.
- Do not implement backend-only validation, authorization, or database logic in the app.
- Do client-side validation only for user experience; backend remains the source of truth.
- Keep mock/demo data clearly separated from real API calls.
- When backend is not ready, use mock services or adapters that can be replaced later without rewriting screens.

### Do

```ts
// src/services/api/auth.api.ts
import { apiClient } from "./client";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login", payload);
}

// Good: screen calls a feature API function, not raw fetch
const result = await login({ email, password });
```

### Don't

```tsx
// Bad: hardcoded URL, untyped response, raw fetch inside screen
const response = await fetch("https://production-api.com/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});

// Bad: frontend pretending to be backend
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

### Do

```tsx
type BalanceCardProps = {
  title: string;
  amount: string;
  caption?: string;
};

export function BalanceCard({ title, amount, caption }: BalanceCardProps) {
  return (
    <View>
      <Text>{title}</Text>
      <Text>{amount}</Text>
      {caption ? <Text>{caption}</Text> : null}
    </View>
  );
}
```

### Don't

```tsx
// Bad: too many flags make the component unclear
<UniversalCard
  type="balance"
  showMoney
  showCaption
  enableHeroMode
  useDashboardLayout
  variant="special"
/>
```

---

## Styling and UI Rules

- Follow the existing design system, theme file (`src/shared/theme/theme.ts`), color tokens (`APP_COLORS`), spacing, typography, and component patterns.
- Do not introduce a new styling approach unless explicitly requested (this project uses NativeWind + Tailwind v4 via `@/tw`).
- Use responsive layout patterns that work on native and web.
- Design mobile-first, then adapt for larger screens.
- Respect safe areas on screens.
- Avoid fixed heights that break on small devices unless required.
- Use touch-friendly sizes for buttons, inputs, and interactive elements.
- Keep visual polish consistent across screens.

### Do

```tsx
<View style={styles.container}>
  <Text style={styles.title}>Welcome back</Text>
</View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
});
```

### Don't

```tsx
// Bad: random one-off values that ignore the app theme
<View style={{ padding: 13, backgroundColor: "#123abc", height: 812 }}>
```

---

## Navigation Rules

- Follow Expo Router file-based routing conventions.
- Use route groups and layout files consistently with the existing app structure.
- Do not navigate by pushing duplicate auth screens when a redirect or replace is more appropriate.
- Use `router.replace` for auth transitions where the user should not go back to the previous screen.
- Use `router.push` only when the previous screen should remain in history.
- Keep navigation logic out of deeply nested presentational components when possible.
- Do not create custom navigation systems if Expo Router already solves the problem.

### Do

```ts
import { router } from "expo-router";

router.replace("/(auth)/sign-in");
```

### Don't

```ts
// Bad for auth redirect because it can stack screens repeatedly
router.push("/sign-in");
router.push("/sign-in");
router.push("/sign-in");
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

### Do

- Do fix the requested screen or feature directly.
- Do keep existing naming and folder conventions.
- Do mention when a requested change may affect navigation, storage, API contracts, or app config.

### Don't

- Don't redesign the entire app when asked to fix one component.
- Don't move files into a new architecture without approval.
- Don't install a new state manager for one shared value.
- Don't replace working code just because another pattern is popular.