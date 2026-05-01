# LexChain — Improvement TODO

Last updated: 2026-04-30

Status legend:
- `[ ]` not started
- `[/]` in progress
- `[x]` done
- `[-]` skipped / deferred

Recommended build order:
1. Phase 1 — Code Structure (do before anything else, unblocks imports everywhere)
2. Phase 2 — Feature Architecture (do while building new screens)
3. Phase 3 — Best Practices (do when backend wiring begins)
4. Phase 4 — Performance & UX Polish (do before any release build)

---

## Phase 1 — Code Structure & Clean Up
Priority: 1 — Do first. These are foundational and unblock everything downstream.

### 1.1 Path Aliases
Status: `[x]`

Files:
- `tsconfig.json`
- `metro.config.js` (may need resolver update for Metro to pick up aliases)

- [x] Add the following alias paths to `tsconfig.json` compilerOptions:
  - `@/features/*` → `src/features/*`
  - `@/shared/*` → `src/shared/*`
  - `@/theme` → `src/shared/theme/theme.ts`
  - `@/hooks` → `src/shared/hooks/index.ts`
  - `@/ui` → `src/shared/components/ui/index.ts`
  - `@/mocks/*` → `src/mocks/*`
  - `@/types` → `src/types/index.ts`
  - `@/constants` → `src/constants/index.ts`
- [x] Verify Metro resolves aliases (check `babel.config.js` or `metro.config.js`)
- [x] Update all existing deep relative imports across the codebase to use aliases

---

### 1.2 Barrel Files
Status: `[x]`

Files to create:
- `src/features/auth/index.ts`
- `src/features/onboarding/index.ts`
- `src/features/documents/index.ts`
- `src/features/document/index.ts`
- `src/features/document/components/index.ts`
- `src/features/upload/index.ts`
- `src/features/profile/index.ts`
- `src/features/dashboard/index.ts`
- `src/shared/components/ui/index.ts`
- `src/shared/hooks/index.ts`

- [x] Create `src/features/auth/index.ts` — re-export AuthScreenShell, AuthHeader, AuthInput, TermsBottomSheet
- [x] Create `src/features/onboarding/index.ts` — re-export GetStartedHero
- [x] Create `src/features/documents/index.ts` — re-export all document list components + mock data
- [x] Create `src/features/document/components/index.ts` — re-export all document detail components
- [x] Create `src/features/document/index.ts` — re-export from components/ and services/
- [x] Create `src/features/upload/index.ts` — re-export all upload components, types, and session
- [x] Create `src/features/profile/index.ts` — re-export all profile components
- [x] Create `src/features/dashboard/index.ts` — re-export all dashboard components and hooks
- [x] Create `src/shared/components/ui/index.ts` — re-export Button, BottomNav, SearchInputWithResults, SelectDropdownField, Collapsible
- [x] Create `src/shared/hooks/index.ts` — re-export useCloseSheetOnBack, useColorScheme, useThemeColor

---

### 1.3 Centralized Types Folder
Status: `[x]`

Files to create:
- `src/types/document.types.ts`
- `src/types/auth.types.ts`
- `src/types/upload.types.ts`
- `src/types/index.ts`

- [x] Create `src/types/document.types.ts` — move DocumentType, DocumentStatusKey, DocumentSortKey, WhitelistGrant, WhitelistSearchResult, ManageWhitelistData, MockDocument
- [x] Create `src/types/auth.types.ts` — add User, LoginPayload, AuthState (ready for backend)
- [x] Create `src/types/upload.types.ts` — move PickedUploadFile from `src/features/upload/upload-file.ts`
- [x] Create `src/types/index.ts` — barrel re-export all types
- [x] Update all import sites to import types from `@/types`

---

### 1.4 Centralized Constants
Status: `[x]`

Files to create:
- `src/constants/storage-keys.ts`
- `src/constants/index.ts`

- [x] Create `src/constants/storage-keys.ts` — replace magic string `'lexchain:document-whitelist'` and add `'lexchain:auth-token'` for when backend lands
- [x] Create `src/constants/index.ts` — barrel re-export
- [x] Update `whitelist-storage.ts` to import from `@/constants`

---

### 1.5 Theme Cleanup
Status: `[x]`

Files:
- `src/shared/theme/theme.ts`

- [x] Export a `fonts` constant from `theme.ts` with `regular`, `medium`, `bold`, `extraBold` keys
- [x] Replace all hardcoded `fontFamily: 'Inter'` strings across StyleSheet files with `fonts.regular` (or the appropriate weight key)
- [x] Centralize the shared app palette in `APP_COLORS` from `theme.ts`

---

### 1.6 Move Mock Data
Status: `[x]`

Files:
- `src/features/documents/mock-documents.ts` — current location
- `src/mocks/data/documents.ts` — target location
- `src/mocks/index.ts` — new barrel

- [x] Create `src/mocks/data/documents.ts` and move mock data there
- [x] Create `src/mocks/index.ts` barrel
- [x] Update all import sites (`app/(tabs)/index.tsx`, `app/(tabs)/documents.tsx`)
- [x] Delete original `src/features/documents/mock-documents.ts` after migration

---

### 1.7 Move `tw.ts`
Status: `[x]`

Files:
- `frontend/tw.ts` — current location (root level, wrong)
- `src/shared/utils/tw.ts` — target location

- [x] Move `tw.ts` from project root into `src/shared/utils/tw.ts`
- [x] Update any import sites

---

### 1.8 Delete Expo Starter Leftovers
Status: `[x]`

Files to delete:
- `src/shared/components/hello-wave.tsx`
- `src/shared/components/parallax-scroll-view.tsx`

- [x] Confirm neither file is referenced anywhere (`grep -r "hello-wave\|parallax-scroll"`)
- [x] Delete `hello-wave.tsx`
- [x] Delete `parallax-scroll-view.tsx`

---

### 1.9 Delete Dead Code
Status: `[x]`

Files to delete:
- `src/features/upload/upload-select-field.tsx` — marked as "alternative", never used

- [x] Confirm `upload-select-field.tsx` has no active import sites
- [x] Delete it

---

### 1.10 Flatten Unnecessary Nesting
Status: `[x]`

Files:
- `src/features/onboarding/get-started-hero.tsx` — current location

- [x] Move `get-started-hero.tsx` up one level (no need for a `components/` subfolder for a single file)
- [x] Delete the now-empty `components/` subfolder
- [x] Update onboarding barrel import

---

## Phase 2 — Feature Architecture
Priority: 2 — Do while building new screens. Keeps route files clean.

### 2.1 Extract Dashboard Styles
Status: `[x]`

Files:
- `src/features/dashboard/dashboard-overview.styles.ts` — current dashboard style location
- `app/(tabs)/documents.styles.ts`
- `app/(tabs)/profile.styles.ts`

- [x] Move dashboard route styles out of `app/(tabs)/index.tsx`
- [x] Move dashboard styles into the dashboard feature folder after 2.2 extraction
- [x] Apply the same styles-extraction pattern to `app/(tabs)/documents.tsx` and `app/(tabs)/profile.tsx` if they also have large StyleSheet blocks

---

### 2.2 Fill the Dashboard Feature Folder
Status: `[x]`

Files to create:
- `src/features/dashboard/dashboard-overview.tsx`
- `src/features/dashboard/dashboard-overview.styles.ts`
- `src/features/dashboard/dashboard-kpi-card.tsx`
- `src/features/dashboard/dashboard-recent-list.tsx`
- `src/features/dashboard/use-dashboard.ts`
- `src/features/dashboard/index.ts`

- [x] Extract dashboard screen JSX from `app/(tabs)/index.tsx` into `dashboard-overview.tsx`
- [x] Extract `KpiCard` component from `app/(tabs)/index.tsx` into `dashboard-kpi-card.tsx`
- [x] Extract `DocumentRow` component from `app/(tabs)/index.tsx` into `dashboard-recent-list.tsx`
- [x] Extract all `useState` / `useMemo` logic into `use-dashboard.ts` hook
- [x] Reduce `app/(tabs)/index.tsx` to a small route wrapper
- [x] Create barrel `src/features/dashboard/index.ts`

---

## Phase 3 — Best Practices
Priority: 3 — Do when backend wiring begins. These are not needed until real API calls exist.

### 3.1 Centralized Error Handling
Status: `[x]`

Files to create:
- `src/shared/utils/api-error.ts`
- `src/shared/hooks/use-error-toast.ts`

- [x] Create `parseApiError(error: unknown): AppError` utility in `api-error.ts`
- [x] Handle Axios errors, network errors, and unknown errors
- [x] Create `useErrorToast` hook that calls `parseApiError` and handles `UNAUTHORIZED` redirect
- [-] Replace all per-screen `try/catch` error handling with `useErrorToast`

---

### 3.2 React Query Setup
Status: `[x]`

Files to create:
- `src/shared/providers/query-client.ts`

- [x] Install `@tanstack/react-query`
- [x] Create `QueryClient` with default `staleTime: 5min`, `gcTime: 10min`, `retry: 2`, `refetchOnFocus: true`
- [x] Wrap `app/_layout.tsx` with `QueryClientProvider`
- [-] Use per-query `staleTime: 30min` override for legal documents (they are stable)
- [x] Add AppState listener in `_layout.tsx` to call `queryClient.invalidateQueries()` on foreground resume

---

### 3.3 Secure Token Storage
Status: `[x]`

Files to create:
- `src/shared/utils/secure-storage.ts`

- [x] Install `expo-secure-store`
- [x] Create `secureStorage` wrapper with `set`, `get`, `delete` methods
- [x] Store auth tokens via `secureStorage`, not `AsyncStorage`
- [x] Keep `AsyncStorage` for non-sensitive data (whitelist, UI preferences)

---

### 3.4 Environment Variables
Status: `[x]`

Files to create:
- `.env.example`
- `src/shared/config/env.ts`
- `src/shared/config/index.ts`

- [x] Create `.env.example` with `EXPO_PUBLIC_API_URL`
- [x] Add real `.env*` files to `.gitignore`
- [x] Keep `.env.example` committed as the safe template
- [x] Create `src/shared/config/env.ts` helper for reading `process.env.EXPO_PUBLIC_API_URL`
- [-] Defer real `.env.development` and `.env.production` files to local/deployment setup
- [-] Defer `src/api/client.ts` until backend endpoints and API client choice are confirmed
- [x] Never hardcode any URL or API key directly in source files

---

### 3.5 Offline Detection
Status: `[x]`

Files to create:
- `src/shared/hooks/use-network.ts`

- [x] Install `@react-native-community/netinfo`
- [x] Create `useNetwork` hook that subscribes to `NetInfo` and returns `{ isOnline }`
- [x] Add an `OfflineBanner` component to `app/_layout.tsx` that renders when offline

---

### 3.6 Shared Query State Components
Status: `[x]`

Files to create:
- `src/shared/components/ui/query-states.tsx`

- [x] Create `LoadingState` component (ActivityIndicator with primary color)
- [x] Create `ErrorState` component (message + retry Button)
- [x] Create `EmptyState` component (message text)
- [-] Replace all per-screen inline loading/error/empty patterns with these shared components

---

### 3.7 Form Validation with Zod
Status: `[x]`

Files to create:
- `src/features/auth/schemas/sign-in.schema.ts`
- `src/features/auth/schemas/sign-up.schema.ts`

- [x] Install `react-hook-form`, `zod`, `@hookform/resolvers`
- [x] Create `signInSchema` with email and password validation
- [x] Create `signUpSchema` with all sign-up field rules (replace manual `validateSignUp`)
- [x] Replace `useState` error fields in `sign-in.tsx` and `sign-up.tsx` with `useForm` + `zodResolver`

---

## Phase 4 — Performance & UX Polish
Priority: 4 — Do before any release or demo build.

### 4.1 Bundle & Build
Status: `[ ]`

Files:
- `metro.config.js`
- `app.json`

- [ ] Add `drop_console: true` and `drop_debugger: true` to Metro `minifierConfig` (strips logs from prod bundle)
- [ ] Verify `jsEngine: "hermes"` is set in `app.json` (should be default in Expo 54, but confirm)
- [ ] Run `npx expo-bundle-visualizer` and audit for unexpectedly large packages
- [ ] Confirm only one icon set is used throughout (MaterialIcons only — no mixing)

---

### 4.2 Font Loading
Status: `[ ]`

Files:
- `app/_layout.tsx`

- [ ] Audit which Inter weights are actually used in StyleSheet files (400, 500, 700, 800)
- [ ] Load only those 4 weights via `useFonts` — remove any others
- [ ] Hook font loading into the splash screen flow (hide splash only after fonts are ready)

---

### 4.3 List Performance
Status: `[ ]`

Files:
- `app/(tabs)/documents.tsx`
- `src/features/document/components/manage-whitelist-bottom-sheet.tsx`

- [ ] Replace `ScrollView + .map()` in the Documents list with `FlatList`
- [ ] Add `getItemLayout`, `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize` to FlatList
- [ ] Wrap `DocumentResultCard` with `React.memo`
- [ ] Wrap press handlers passed as props with `useCallback`
- [ ] Review whitelist grants list — switch to FlatList if it can grow large

---

### 4.4 Image Optimization
Status: `[ ]`

Files:
- `app/camera-capture.tsx` (already uses expo-image ✓)
- `app/capture-review.tsx` (already uses expo-image ✓)
- Any future screens that add real document thumbnails

- [ ] When real document thumbnails or user avatars are added, use `expo-image` with `cachePolicy="memory-disk"` and a `placeholder` blurhash
- [ ] Never use React Native's default `Image` component for remote URLs

---

### 4.5 Animations
Status: `[ ]`

Files:
- `app/(tabs)/documents.tsx`
- `app/(tabs)/index.tsx`

- [ ] Add `Animated.View` with `FadeInDown.delay(i * 60).springify()` stagger to the Documents list
- [ ] Add `FadeInDown` entrance animation to Dashboard KPI cards
- [ ] Confirm all `Animated.timing` / `Animated.spring` calls use `useNativeDriver: true`
- [ ] Verify `Layout.springify()` is used on list reorders (filter/sort changes)

---

### 4.6 Haptics
Status: `[ ]`

Files:
- `app/upload.tsx`
- `app/processing.tsx`
- `app/(tabs)/documents.tsx`

- [ ] `expo-haptics` is already installed — wire it up
- [ ] Add `Haptics.impactAsync(Light)` on all primary button presses
- [ ] Add `Haptics.notificationAsync(Success)` when upload processing completes
- [ ] Add `Haptics.notificationAsync(Success)` when a whitelist grant is added
- [ ] Add `Haptics.notificationAsync(Error)` when a form validation error fires

---

### 4.7 Skeleton Loaders
Status: `[ ]`

Files:
- `app/(tabs)/documents.tsx`
- `app/(tabs)/index.tsx`

- [ ] Install `moti` (for skeleton) or `react-native-skeleton-placeholder`
- [ ] Replace `ActivityIndicator` loading states on Documents list with a skeleton that matches the card shape
- [ ] Add skeleton placeholders to Dashboard KPI cards during load
- [ ] Add skeleton to the whitelist grants list inside the manage-whitelist sheet

---

### 4.8 UX Details
Status: `[ ]`

Files:
- `src/features/auth/auth-screen-shell.tsx`
- All screens with forms

- [ ] Wrap all auth screens in `KeyboardAvoidingView` (`behavior="padding"` on iOS, `"height"` on Android)
- [ ] Add `pressed` scale/opacity feedback to all `Pressable` card components (`{ opacity: 0.85, transform: [{ scale: 0.98 }] }`)
- [ ] Audit every touchable in the app — every tappable surface must have a visible pressed state

---

## Release QA Checklist
Run through this before any demo or build submission.

### Performance
- [ ] No `console.log` in production (Metro config handles via `drop_console`)
- [ ] `FlatList` used for all scrollable lists, not `ScrollView + .map()`
- [ ] All remote images use `expo-image` with `cachePolicy`
- [ ] No inline style objects `style={{ ... }}` — all styles in `StyleSheet.create`

### Feel
- [ ] Every button and card has a pressed state (opacity/scale)
- [ ] Haptics fire on primary actions (upload complete, verify, whitelist add)
- [ ] Skeleton loaders shown on all data screens, no raw spinners
- [ ] Document list animates in with stagger on screen load
- [ ] All animations use `useNativeDriver: true`

### Security
- [ ] Auth tokens stored in `expo-secure-store`, never `AsyncStorage`
- [ ] No hardcoded API URLs or keys in source files
- [ ] All environment-specific values live in `.env.*` files
- [ ] `console.log` stripped in prod build

### Bundle
- [ ] Only 4 Inter font weights loaded (400, 500, 700, 800)
- [ ] Single icon set used throughout (MaterialIcons only)
- [ ] `expo-bundle-visualizer` run — no surprise large packages
- [ ] Hermes JS engine confirmed enabled in `app.json`

---

## Notes

- Phase 1 items are pure cleanup — no behavior changes, safe to do anytime.
- Phase 3 items are not urgent until a real backend API exists; wiring them in before that just adds dead code.
- Phase 4 performance items (FlatList, memo) only matter at scale — with 2 mock documents they are invisible, but build the habits now.
- The `src/features/dashboard/` folder is currently empty. It should be filled before adding any new dashboard widgets.
- `admin/` route folder is empty and should stay that way until admin screens are scoped.
- Keep `@react-native-community/datetimepicker` for now; only revisit `@expo/ui` date picker if the project moves to a dev client.
- Frontend package manager is `pnpm` — use `pnpm add` for all installs, never `npm install`.
