# LexChain Frontend UI Todo

Last updated: 2026-05-01

Status legend:
- `done`
- `in progress`
- `blocked`
- `not started`

Recommended build priority:
1. Finish auth flow (`sign-in`, `sign-up`, shared auth components)
2. Polish onboarding only after auth screens visually align
3. Build user dashboard
4. Build search flow
5. Build upload and processing flow
6. Build whitelist management
7. Build document details
8. Run final cross-screen QA
9. Start `TOBE_SOON.md` Phase 1 code structure cleanup

## 1. Get Started
Priority: 2
Status: `done`
- [x] Section complete

Files:
- `app/index.tsx`
- `src/features/onboarding/get-started-hero.tsx`
- `src/shared/components/ui/button.tsx`

Design source:
- `lexchain-ui-design.pen` → Node `NMB0c` → `1. Get Started`

- [x] Build initial screen layout
- [x] Simplify hero section
- [x] Apply full-screen gradient background
- [x] Add bottom glass-style content panel
- [x] Replace hero placeholder with final artwork or product mockup when final assets are available
- [x] Final spacing and typography polish after auth screens match

## 2. Shared UI Components
Priority: 1
Status: `done`
- [x] Section complete

Files:
- `src/shared/components/ui/button.tsx`
- `src/shared/components/ui/search-input-with-results.tsx`
- `src/shared/components/ui/select-dropdown-field.tsx`
- Future shared components may live under `src/shared/components/ui/`

Design source:
- Shared across onboarding/auth/dashboard flows
- Button style taken from multiple nodes in `lexchain-ui-design.pen`

- [x] Build reusable `Button`
- [x] Add dark-surface variant if needed for glass or gradient backgrounds
- [x] Add loading/disabled visual QA across all button variants
- [x] Document button usage patterns
- [x] Add `light` variant for gradient, dark, and glass surfaces
- [x] Add reusable search input with absolute results dropdown + empty state support
- [x] Add reusable select dropdown field with outside-tap close behavior

## 3. Auth Shared Components
Priority: 1
Status: `done`
- [x] Section complete

Files:
- `src/features/auth/auth-screen-shell.tsx`
- `src/features/auth/auth-header.tsx`
- `src/features/auth/auth-input.tsx`

Design source:
- `lexchain-ui-design.pen` → Node `tR6Ho` → `2. Sign In`
- `lexchain-ui-design.pen` → Node `QVvp6` → `3. Sign Up`

- [x] Build `auth-screen-shell.tsx`
- [x] Build `auth-header.tsx`
- [x] Build `auth-input.tsx`
- [x] Add password visibility toggle
- [x] Add input validation and error states
- [x] Add focused input state polish

## 4. Sign In
Priority: 1
Status: `done`
- [x] Section complete

Files:
- `app/(auth)/sign-in.tsx`
- Depends on:
  - `src/features/auth/auth-screen-shell.tsx`
  - `src/features/auth/auth-header.tsx`
  - `src/features/auth/auth-input.tsx`
  - `src/shared/components/ui/button.tsx`

Design source:
- `lexchain-ui-design.pen` → Node `tR6Ho` → `2. Sign In`

- [x] Build initial screen structure
- [x] Fix final routes
- [x] Wire real sign-in action
- [x] Add forgot-password behavior
- [x] Add validation and error handling
- [x] Review final visual alignment against design

## 5. Sign Up
Priority: 1
Status: `done`
- [x] Section complete

Files:
- `app/(auth)/sign-up.tsx`
- Depends on:
  - `src/features/auth/auth-screen-shell.tsx`
  - `src/features/auth/auth-header.tsx`
  - `src/features/auth/auth-input.tsx`
  - `src/shared/components/ui/button.tsx`

Design source:
- `lexchain-ui-design.pen` → Node `QVvp6` → `3. Sign Up`

- [x] Build screen structure
- [x] Add first name and last name row
- [x] Add email, password, confirm password fields
- [x] Wire route back to sign-in
- [x] Add validation and error states
- [x] Review final visual alignment against design

## 6. Post-Auth Screens
Priority: 3+
Status: `complete`
- [x] Section complete

Primary files:
- `app/(tabs)/index.tsx` → User Dashboard
- `app/(tabs)/documents.tsx` → Documents
- `app/(tabs)/profile.tsx` → Profile
- `app/upload.tsx` → Upload
- `app/document/[id].tsx` → Document Details fallback route, kept but not used in current app flow
- `app/verify/[id].tsx` → Verify fallback route, kept but not used in current app flow
- Additional route files may still be added later for processing states or expanded details flows

Design source:
- `lexchain-ui-design.pen` → Node `UBFA5` → `5. User Dashboard`
- `lexchain-ui-design.pen` → Node `PjCjq` → `6. Search Documents`
- `lexchain-ui-design.pen` → Node `gOFki` / `2Htek` → `7. Upload Document`
- `lexchain-ui-design.pen` → Node `qhLDy` / `eg52P` → `8. Processing and Summary`
- `lexchain-ui-design.pen` → Node `nPo0L`, `lfwfT`, `9xCyR`, `IuJJz`, `7biAt`, `EVHsl` → `9. Whitelist Management` states
- `lexchain-ui-design.pen` → Node `FRuIN` → `11. Document Details`

- Screen-level progress:
  - [x] User Dashboard
  - [x] Documents
  - [x] Profile
  - [x] Upload Document
  - [x] Processing and Summary
  - [x] Whitelist Management
  - [x] Document Details

- Component/interactions-level progress:
  - [x] Shared custom bottom nav
  - [x] Document preview bottom sheet
  - [x] Verify bottom sheet
  - [x] Whitelist action sheet
  - [x] Manage whitelist bottom sheet
  - [x] Upload type dropdown/select behavior
  - [x] Upload file picker behavior
  - [x] Upload camera capture flow
  - [x] Upload queue supports multiple selected files and multiple captured pages
  - [x] Upload queue supports per-item remove action
  - [x] Documents search behavior
  - [x] Replace temporary Documents filter chips with real Filter + Sort UX
  - [x] Dashboard KPI/data wiring
  - [x] Profile settings row behavior
  - [x] Whitelist persistence wiring
    - [x] local AsyncStorage persistence
    - [x] frontend kept backend-ready for future API integration
  - [x] Whitelist empty/no-results/loading states
    - [x] no-results state
    - [x] empty grants state
    - [x] loading state
  - [x] Decide final destination for document details: use bottom sheets as primary UX and stop routing into full-screen document/verify fallback files
  - [x] Processing completion actions now return to Documents instead of opening fallback document/verify routes

Post-auth implementation notes:
- [x] Build shared custom bottom nav
- [x] Wire Home, Documents, Profile tab navigation
- [x] Replace Expo starter tab content
- [x] Add document preview bottom sheet flow from Documents list
- [x] Add verify bottom sheet flow from Documents list
- [x] Add whitelist action sheet from Documents list
- [x] Add live whitelist add/remove interactions
- [x] Add live whitelist grant action behavior (`View` / `Verify`)
- [x] Make whitelist search results float as absolute dropdown
- [x] Add whitelist empty grants state
- [x] Add whitelist loading state
- [x] Persist whitelist changes locally with AsyncStorage
- [x] Add basic persistence error logging for whitelist hydrate/add/revoke flows
- [x] Add toast feedback for whitelist hydrate/add/revoke flows
- [x] Keep whitelist/frontend state shaped for future backend integration
- [x] Make Documents search filter the rendered list directly
- [x] Make back button / back gesture close open auth/document bottom sheets first
- [x] Extract shared select dropdown field and reuse it for Upload + Documents filter dropdowns
- [x] Replace `DATE / TITLE / CONTENT` chips with explicit Filter + Sort controls
- [x] Add real structured filter options for Documents
  - [x] document type dropdown
  - [x] native date picker
  - [x] status dropdown
- [x] Add explicit sort options for Documents
  - [x] newest
  - [x] oldest
  - [x] title A-Z
- [x] Use Expo Go-compatible native date picker for Documents filters (`@react-native-community/datetimepicker`)
- [x] Extract shared document mock source so Dashboard and Documents stay in sync
- [x] Add lightweight in-app profile settings detail modal for placeholder settings rows
- [x] Finish Upload actions: file picker, camera capture, type select
- [x] Add dedicated capture review screen for queued camera pages
- [x] Show captured pages as grid collection in capture review
- [x] Open captured page in full-screen modal preview on tap
- [x] Polish custom camera UI to edge-to-edge preview with minimal floating controls
- [x] Move capture queue count into collections button notification bubble
- [x] Finalize Processing and Summary screen from design node
  - [x] screen structure and processing state
  - [x] real loading/progress behavior
  - [x] completed-state polish and final CTA cleanup
- [x] Decide whether fallback full routes remain or are removed once bottom-sheet flow is final
  - Decision: keep the route files for now, but do not route users into them from the current app flow
  - Current app flow returns users to `/(tabs)/documents` after processing instead of opening `/document/[id]` or `/verify/[id]`

## 7. Cross-Screen Polish
Priority: 8
Status: `done`
- [x] Section complete

Files involved:
- `app/index.tsx`
- `app/(auth)/sign-in.tsx`
- `app/(auth)/sign-up.tsx`
- `src/features/onboarding/get-started-hero.tsx`
- `src/features/auth/auth-screen-shell.tsx`
- `src/features/auth/auth-header.tsx`
- `src/features/auth/auth-input.tsx`
- `src/shared/components/ui/button.tsx`

Design source:
- Entire `lexchain-ui-design.pen` mobile flow

- [x] Confirm typography scale consistency
  - [x] Align shared post-auth screen header spacing and title/body rhythm
  - [x] Tighten high-visibility card typography on Documents and Profile
  - [x] Final pass on remaining secondary components
- [x] Confirm spacing rhythm consistency
  - [x] Normalize primary post-auth screen gutters to 16px side margins
  - [x] Final pass on internal card/content spacing
- [x] Confirm button/icon consistency
- [x] Check mobile responsiveness on target viewport sizes
  - [x] Manual check completed by user on target Android/iOS-style mobile widths
- [x] Replace placeholder copy where needed
- [x] Final browser QA pass

## 8. Refactor / Structure Backlog
Priority: 10
Status: `done`
- [x] Section complete

Reference source:
- `../TOBE_SOON.md`

Goal:
- Keep frontend UI work complete while tracking the next maintainability phase separately
- Use `TOBE_SOON.md` as the source of truth for code structure, feature architecture, backend-ready best practices, and release polish

Recommended next order from `TOBE_SOON.md`:
1. Phase 1 — Code Structure & Clean Up
2. Phase 2 — Feature Architecture
3. Phase 3 — Best Practices when backend API wiring begins
4. Phase 4 — Performance & UX Polish before demo/release build

Immediate recommended next target:
- [x] Start Phase 1.1 Path Aliases
- [x] Then Phase 1.2 Barrel Files
- [x] Then Phase 1.3 Centralized Types Folder
- [x] Then Phase 1.4 Centralized Constants

Phase 1 mirror checklist from `TOBE_SOON.md`:
- [x] 1.1 Path Aliases
  - [x] Add feature/shared/theme/hooks/ui/mocks/types/constants aliases to `tsconfig.json`
  - [x] Verify Metro alias resolution through `metro.config.js` / Babel setup
  - [x] Update existing component import sites after aliases and barrels are confirmed
- [x] 1.2 Barrel Files
  - [x] Add feature barrels for auth, onboarding, documents, document, upload, profile, dashboard
  - [x] Add shared UI and shared hooks barrels
  - [x] Update component import sites to use feature/shared barrels where available
- [x] 1.3 Centralized Types Folder
  - [x] Create document/auth/upload type files and `src/types/index.ts`
  - [x] Move shared feature types into `@/types`
- [x] 1.4 Centralized Constants
  - [x] Move storage keys into `src/constants/storage-keys.ts`
  - [x] Update whitelist storage to use `@/constants`
- [x] 1.5 Theme Cleanup
  - [x] Export shared fonts and colors from `src/shared/theme/theme.ts`
  - [x] Replace repeated `fontFamily: 'Inter'` with shared `fonts.regular`
  - [x] Replace duplicated shared color constants with `APP_COLORS`
- [x] 1.6 Move Mock Data
  - [x] Move document mocks into `src/mocks/data/documents.ts`
  - [x] Add `src/mocks/index.ts`
- [x] 1.7 Move `tw.ts`
  - [x] Move root `tw.ts` into `src/shared/utils/tw.ts`
- [x] 1.8 Delete Expo Starter Leftovers
  - [x] Confirm no references, then delete unused starter components
- [x] 1.9 Delete Dead Code
  - [x] Confirm and delete unused `upload-select-field.tsx`
- [x] 1.10 Flatten Unnecessary Nesting
  - [x] Move onboarding hero up one level if the folder remains single-file

Notes:
- Do not start Phase 3 backend/data tooling until real backend endpoints exist
- Keep using `pnpm`, not `npm`
- Treat this section as a pointer to `TOBE_SOON.md`, not a duplicate full backlog

## 9. Expo Best Practices Adoption
Priority: 9
Status: `in progress`
- [ ] Section complete

Reference source:
- `expo-best-practices.md`

Goal:
- Track which Expo/RN best-practice ideas are worth adopting in this project
- Avoid blindly adding libraries or patterns that the current app does not need yet

Recommended adoption order:
1. Add lightweight UX improvements that fit the current app
2. Add performance/list optimizations only where screens actually need them
3. Add production/build improvements when preparing preview or release builds

Project recommendation summary:
- Adopt first:
  - toast notifications
  - skeleton/loading states
  - targeted `expo-image` usage when real assets are added
  - `FlashList` only if documents/whitelist lists grow
- Adopt later:
  - Zustand / persistence
  - InteractionManager optimizations
  - lazy-loading heavy screens
  - EAS build/release setup
- Skip for now:
  - broad memoization (`useMemo` / `useCallback`) without measured need
  - adding libraries that solve problems this app does not have yet

### 9.1 UX Utilities
- [REC: adopt first] Decide whether to add toast notifications (`sonner-native`)
  - Use cases in this app:
    - upload success/failure
    - whitelist add/revoke feedback
    - auth success/error feedback
- [x] Add `<Toaster />` to `app/_layout.tsx`
- [x] Replace silent placeholder actions with toast feedback
  - [x] whitelist hydrate/add/revoke feedback
  - [x] upload feedback
  - [x] auth feedback

- [x] Adopt skeleton loading
  - [x] Create shared manual skeleton UI component
  - [x] Add skeleton to whitelist loading state
  - [x] Add dashboard card skeleton component for future loading
  - [x] Add documents list skeleton component for future backend loading
  - [x] Add profile summary skeleton component for future backend loading
  - [-] Add skeleton to processing screen skipped because processing already has progress UI

### 9.2 Images and Assets
- [x] Decide whether to replace image usage with `expo-image` where beneficial
  - Existing app image usage already uses `expo-image`
  - No React Native default `Image` usage found in current app code
- [-] Preload any critical onboarding/profile/document preview images if real assets are introduced
  - Deferred until real remote or critical above-the-fold image assets exist
- [x] Audit font weight loading
  - Used UI weights: `500`, `600`, `700`, `800`
  - Current app does not load Inter font files via `useFonts`, and no local font assets exist to remove
  - If Inter font files are added later, only load the used weights above

### 9.3 Lists and Rendering
- [x] Review long-list candidates for virtualized rendering
  - [x] Documents list now uses `FlatList`
  - [-] Whitelist grants and whitelist search results deferred until backend scale needs virtualization
- [x] Keep `ScrollView` for short static screens only
  - Static/shell screens can stay on `ScrollView`
  - Documents search results use a virtualized list because the list can grow

### 9.4 State Management
- [x] Move document and whitelist state to a backend-ready Zustand store
  - [x] Add `zustand`
  - [x] Persist document whitelist state with AsyncStorage
  - [x] Keep profile state local until backend profile data exists
  - [x] Keep auth token storage deferred to backend/auth wiring

### 9.5 Performance
- [x] Review callback/object stability on interactive screens
  - [x] Documents list handlers stabilized for `FlatList`
  - [-] Upload deferred until a measured rerender issue appears
  - [-] Whitelist management deferred until backend-scale list behavior exists
- [x] Add memoization only where it solves a real rerender/list stability problem
- [-] Use `InteractionManager` deferred until heavy post-navigation work is added

### 9.6 Bundle and Startup
- [x] Confirm Hermes / new architecture settings in Expo config
  - [x] `newArchEnabled` is enabled
  - [x] `jsEngine` is explicitly set to `hermes`
- [x] Review imports for bundle size issues before production
  - [x] Current large dependencies are app-level libraries already used by implemented screens
  - [x] Metro production minifier strips `console` and `debugger`
- [-] Consider lazy-loading heavy screens only if app grows significantly
  - Deferred until the app has heavier routes, remote media, or measured startup pressure

### 9.7 Build and Release
- [REC: later] Decide when to add `eas.json`
- [REC: later] Configure EAS build profiles when project is ready for tester distribution
- [REC: later] Review tree-shaking guidance based on actual Expo SDK version
- [REC: later] Run bundle-size analysis before production build

## Notes
- Ignore device mockup framing from `.pen` file, including black outer device frame and fake status bar rows used only for presentation.
- Implement only actual in-app UI.
- Treat `expo-best-practices.md` as an adoption reference, not a requirement to install every library immediately.
- Use `../TOBE_SOON.md` as the next source of truth after UI polish; Phase 1 and Phase 2 cleanup are complete.
- No real backend endpoints/API exist yet, so current document/whitelist/auth work should stay frontend-complete and backend-ready.
- Keep `@react-native-community/datetimepicker` for now because it works in Expo Go.
- Frontend package manager is `pnpm`; prefer `pnpm` commands going forward.
- Current route groups confirmed:
  - `app/index.tsx`
  - `app/(auth)/sign-in.tsx`
  - `app/(auth)/sign-up.tsx`
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/documents.tsx`
  - `app/(tabs)/profile.tsx`
  - `app/upload.tsx`
  - `app/document/[id].tsx` kept as unused fallback route
  - `app/verify/[id].tsx` kept as unused fallback route
- Current next target:
  - `TODO-FRONTEND.md` 9.1 Skeleton loading states

## Dev Client
- `@expo/ui` only as optional dev-client UI polish.
- `@expo/ui/datetimepicker` is Android/iOS compatible, but keep `@react-native-community/datetimepicker` unless the team wants dev-client-only modern native picker polish.
