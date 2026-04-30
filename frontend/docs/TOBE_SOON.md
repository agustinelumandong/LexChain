# LexChain — Improvement TODO

Last updated: 2026-07-14

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
Status: `[ ]`

Files:
- `tsconfig.json`
- `metro.config.js` (may need resolver update for Metro to pick up aliases)

- [ ] Add the following alias paths to `tsconfig.json` compilerOptions:
  - `@/features/*` → `src/features/*`
  - `@/shared/*` → `src/shared/*`
  - `@/theme` → `src/shared/theme/theme.ts`
  - `@/hooks` → `src/shared/hooks/index.ts`
  - `@/ui` → `src/shared/components/ui/index.ts`
  - `@/mocks/*` → `src/mocks/*`
  - `@/types` → `src/types/index.ts`
  - `@/constants` → `src/constants/index.ts`
- [ ] Verify Metro resolves aliases (check `babel.config.js` or `metro.config.js`)
- [ ] Update all existing deep relative imports across the codebase to use aliases

---

### 1.2 Barrel Files
Status: `[ ]`

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

- [ ] Create `src/features/auth/index.ts` — re-export AuthScreenShell, AuthHeader, AuthInput, TermsBottomSheet
- [ ] Create `src/features/onboarding/index.ts` — re-export GetStartedHero
- [ ] Create `src/features/documents/index.ts` — re-export all document list components + mock data
- [ ] Create `src/features/document/components/index.ts` — re-export all document detail components
- [ ] Create `src/features/document/index.ts` — re-export from components/ and services/
- [ ] Create `src/features/upload/index.ts` — re-export all upload components, types, and session
- [ ] Create `src/features/profile/index.ts` — re-export all profile components
- [ ] Create `src/features/dashboard/index.ts` — re-export all dashboard components and hooks
- [ ] Create `src/shared/components/ui/index.ts` — re-export Button, BottomNav, SearchInputWithResults, SelectDropdownField, Collapsible
- [ ] Create `src/shared/hooks/index.ts` — re-export useCloseSheetOnBack, useColorScheme, useThemeColor

---

### 1.3 Centralized Types Folder
Status: `[ ]`

Files to create:
- `src/types/document.types.ts`
- `src/types/auth.types.ts`
- `src/types/upload.types.ts`
- `src/types/index.ts`

- [ ] Create `src/types/document.types.ts` — move DocumentType, DocumentStatusKey, DocumentSortKey, WhitelistGrant, WhitelistSearchResult, ManageWhitelistData, MockDocument
- [ ] Create `src/types/auth.types.ts` — add User, LoginPayload, AuthState (ready for backend)
- [ ] Create `src/types/upload.types.ts` — move PickedUploadFile from `src/features/upload/upload-file.ts`
- [ ] Create `src/types/index.ts` — barrel re-export all types
- [ ] Update all import sites to import types from `@/types`

---

### 1.4 Centralized Constants
Status: `[ ]`

Files to create:
- `src/constants/storage-keys.ts`
- `src/constants/index.ts`

- [ ] Create `src/constants/storage-keys.ts` — replace magic string `'lexchain:document-whitelist'` and add `'lexchain:auth-token'` for when backend lands
- [ ] Create `src/constants/index.ts` — barrel re-export
- [ ] Update `whitelist-storage.ts` to import from `@/constants`

---

### 1.5 Theme Cleanup
Status: `[ ]`

Files:
- `src/shared/theme/theme.ts`

- [ ] Export a `fonts` constant from `theme.ts` with `regular`, `medium`, `bold`, `extraBold` keys
- [ ] Replace all hardcoded `fontFamily: 'Inter'` strings across StyleSheet files with `fonts.regular` (or the appropriate weight key)
- [ ] Make sure `COLORS` is exported from `theme.ts` and is the single source of truth for the design palette (currently re-declared in every screen file)

---

### 1.6 Move Mock Data
Status: `[ ]`

Files:
- `src/features/documents/mock-documents.ts` — current location
- `src/mocks/data/documents.ts` — target location
- `src/mocks/index.ts` — new barrel

- [ ] Create `src/mocks/data/documents.ts` and move mock data there
- [ ] Create `src/mocks/index.ts` barrel
- [ ] Update all import sites (`app/(tabs)/index.tsx`, `app/(tabs)/documents.tsx`)
- [ ] Delete original `src/features/documents/mock-documents.ts` after migration

---

### 1.7 Move `tw.ts`
Status: `[ ]`

Files:
- `frontend/tw.ts` — current location (root level, wrong)
- `src/shared/utils/tw.ts` — target location

- [ ] Move `tw.ts` from project root into `src/shared/utils/tw.ts`
- [ ] Update any import sites

---

### 1.8 Delete Expo Starter Leftovers
Status: `[ ]`

Files to delete:
- `src/shared/components/hello-wave.tsx`
- `src/shared/components/parallax-scroll-view.tsx`

- [ ] Confirm neither file is referenced anywhere (`grep -r "hello-wave\|parallax-scroll"`)
- [ ] Delete `hello-wave.tsx`
- [ ] Delete `parallax-scroll-view.tsx`

---

### 1.9 Delete Dead Code
Status: `[ ]`

Files to delete:
- `src/features/upload/upload-select-field.tsx` — marked as "alternative", never used

- [ ] Confirm `upload-select-field.tsx` has no active import sites
- [ ] Delete it

---

### 1.10 Flatten Unnecessary Nesting
Status: `[ ]`

Files:
- `src/features/onboarding/components/get-started-hero.tsx` — current location
- `src/features/onboarding/get-started-hero.tsx` — target location

- [ ] Move `get-started-hero.tsx` up one level (no need for a `components/` subfolder for a single file)
- [ ] Delete the now-empty `components/` subfolder
- [ ] Update import in `app/index.tsx`

---

## Phase 2 — Feature Architecture
Priority: 2 — Do while building new screens. Keeps route files clean.

### 2.1 Extract Dashboard Styles
Status: `[ ]`

Files:
- `app/(tabs)/index.tsx` — currently holds styles, kpiStyles, docStyles
- `app/(tabs)/index.styles.ts` — create this

- [ ] Create `app/(tabs)/index.styles.ts` and move all three StyleSheet blocks there
- [ ] Import the styles back into `index.tsx`
- [ ] Apply the same styles-extraction pattern to `app/(tabs)/documents.tsx` and `app/(tabs)/profile.tsx` if they also have large StyleSheet blocks

---

### 2.2 Fill the Dashboard Feature Folder
Status: `[ ]`

Files to create:
- `src/features/dashboard/dashboard-kpi-card.tsx`
- `src/features/dashboard/dashboard-recent-list.tsx`
- `src/features/dashboard/use-dashboard.ts`
- `src/features/dashboard/index.ts`

- [ ] Extract `KpiCard` component from `app/(tabs)/index.tsx` into `dashboard-kpi-card.tsx`
- [ ] Extract `DocumentRow` component from `app/(tabs)/index.tsx` into `dashboard-recent-list.tsx`
- [ ] Extract all `useState` / `useMemo` logic into `use-dashboard.ts` hook
- [ ] Reduce `app/(tabs)/index.tsx` to ~25–40 lines (JSX + hook calls only)
- [ ] Create barrel `src/features/dashboard/index.ts`

---

## Phase 3 — Best Practices
Priority: 3 — Do when backend wiring begins. These are not needed until real API calls exist.

### 3.1 Centralized Error Handling
Status: `[ ]`

Files to create:
- `src/shared/utils/api-error.ts`
- `src/shared/hooks/use-error-toast.ts`

- [ ] Create `parseApiError(error: unknown): AppError` utility in `api-error.ts`
- [ ] Handle Axios errors, network errors, and unknown errors
- [ ] Create `useErrorToast` hook that calls `parseApiError` and handles `UNAUTHORIZED` redirect
- [ ] Replace all per-screen `try/catch` error handling with `useErrorToast`

---

### 3.2 React Query Setup
Status: `[ ]`

Files to create:
- `src/shared/providers/query-client.ts`

- [ ] Install `@tanstack/react-query`
- [ ] Create `QueryClient` with default `staleTime: 5min`, `gcTime: 10min`, `retry: 2`, `refetchOnFocus: true`
- [ ] Wrap `app/_layout.tsx` with `QueryClientProvider`
- [ ] Use per-query `staleTime: 30min` override for legal documents (they are stable)
- [ ] Add AppState listener in `_layout.tsx` to call `queryClient.invalidateQueries()` on foreground resume

---

### 3.3 Secure Token Storage
Status: `[ ]`

Files to create:
- `src/shared/utils/secure-storage.ts`

- [ ] Install `expo-secure-store`
- [ ] Create `secureStorage` wrapper with `set`, `get`, `delete` methods
- [ ] Store auth tokens via `secureStorage`, not `AsyncStorage`
- [ ] Keep `AsyncStorage` for non-sensitive data (whitelist, UI preferences)

---

### 3.4 Environment Variables
Status: `[ ]`

Files to create:
- `.env.development`
- `.env.production`
- `src/api/client.ts`

- [ ] Create `.env.development` with `EXPO_PUBLIC_API_URL=http://192.168.x.x:8000`
- [ ] Create `.env.production` with `EXPO_PUBLIC_API_URL=https://api.lexchain.com`
- [ ] Add both `.env.*` files to `.gitignore`
- [ ] Create `src/api/client.ts` with an `axios` instance using `process.env.EXPO_PUBLIC_API_URL`
- [ ] Never hardcode any URL or API key directly in source files

---

### 3.5 Offline Detection
Status: `[ ]`

Files to create:
- `src/shared/hooks/use-network.ts`

- [ ] Install `@react-native-community/netinfo`
- [ ] Create `useNetwork` hook that subscribes to `NetInfo` and returns `{ isOnline }`
- [ ] Add an `OfflineBanner` component to `app/_layout.tsx` that renders when offline

---

### 3.6 Shared Query State Components
Status: `[ ]`

Files to create:
- `src/shared/components/ui/query-states.tsx`

- [ ] Create `LoadingState` component (ActivityIndicator with primary color)
- [ ] Create `ErrorState` component (message + retry Button)
- [ ] Create `EmptyState` component (message text)
- [ ] Replace all per-screen inline loading/error/empty patterns with these shared components

---

### 3.7 Form Validation with Zod
Status: `[ ]`

Files to create:
- `src/features/auth/schemas/sign-in.schema.ts`
- `src/features/auth/schemas/sign-up.schema.ts`

- [ ] Install `react-hook-form`, `zod`, `@hookform/resolvers`
- [ ] Create `signInSchema` with email and password validation
- [ ] Create `signUpSchema` with all sign-up field rules (replace manual `validateSignUp`)
- [ ] Replace `useState` error fields in `sign-in.tsx` and `sign-up.tsx` with `useForm` + `zodResolver`

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