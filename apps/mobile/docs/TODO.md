# LexChain Frontend UI Todo

Last updated: 2026-04-23

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

## 1. Get Started
Priority: 2
Status: `LATER`
- [/] Section complete

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
- [JUST SKIP THIS FOR NOW] Replace hero placeholder with final artwork or product mockup
- [COME BACK LATER] Final spacing and typography polish after auth screens match

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
Status: `in progress`
- [ ] Section complete

Primary files:
- `app/(tabs)/index.tsx` → User Dashboard
- `app/(tabs)/documents.tsx` → Documents
- `app/(tabs)/profile.tsx` → Profile
- `app/upload.tsx` → Upload
- `app/document/[id].tsx` → Document Details route fallback
- `app/verify/[id].tsx` → Verify route fallback
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
  - [/] Upload Document
  - [/] Processing and Summary
  - [/] Whitelist Management
  - [/] Document Details

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
  - [ ] Dashboard KPI/data wiring
  - [ ] Profile settings row behavior
  - [ ] Whitelist persistence/backend wiring
  - [/] Whitelist empty/no-results/loading states
    - [x] no-results state
    - [ ] empty grants state
    - [ ] loading state
  - [ ] Decide final destination for document details: bottom-sheet only or keep fallback routes

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
- [ ] Revisit `@expo/ui` modern date picker only if the project moves to a dev client
- [x] Finish Upload actions: file picker, camera capture, type select
- [x] Add dedicated capture review screen for queued camera pages
- [/] Finalize Processing and Summary screen from design node
  - [x] screen structure and processing state
  - [ ] real loading/progress behavior
- [ ] Decide whether fallback full routes remain or are removed once bottom-sheet flow is final

## 7. Cross-Screen Polish
Priority: 8
Status: `not started`
- [ ] Section complete

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

- [ ] Confirm typography scale consistency
- [ ] Confirm spacing rhythm consistency
- [ ] Confirm button/icon consistency
- [ ] Check mobile responsiveness on target viewport sizes
- [ ] Replace placeholder copy where needed
- [ ] Final browser QA pass

## 8. Expo Best Practices Adoption
Priority: 9
Status: `not started`
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

### 8.1 UX Utilities
- [REC: adopt first] Decide whether to add toast notifications (`sonner-native`)
  - Use cases in this app:
    - upload success/failure
    - whitelist add/revoke feedback
    - auth success/error feedback
- [REC: adopt first] If adopted, add `<Toaster />` to `app/_layout.tsx`
- [REC: adopt first] If adopted, replace silent placeholder actions with toast feedback

- [REC: adopt first] Decide whether to add skeleton loading
  - Options:
    - `moti/skeleton`
    - manual shimmer
- [REC: adopt first] If adopted, use skeletons for:
  - dashboard cards
  - documents list
  - profile summary
  - processing screen loading states

### 8.2 Images and Assets
- [REC: later] Decide whether to replace image usage with `expo-image` where beneficial
- [REC: later] Preload any critical onboarding/profile/document preview images if real assets are introduced
- [REC: adopt first] Only load font weights actually used by the UI

### 8.3 Lists and Rendering
- [REC: later] Review long-list candidates for `FlashList`
  - likely candidates:
    - documents list
    - whitelist grants
    - whitelist search results
- [REC: adopt first] Keep `ScrollView` for short static screens only

### 8.4 State Management
- [REC: later] Decide whether whitelist/document/profile state should stay local or move to Zustand
- [REC: later] If global/persistent state becomes necessary, add Zustand store intentionally
- [REC: later] If persistence is needed later, evaluate Zustand + AsyncStorage

### 8.5 Performance
- [REC: later] Review callback/object stability on interactive screens
  - documents
  - upload
  - whitelist management
- [REC: skip for now] Add memoization only where it solves a real rerender problem
- [REC: later] Use `InteractionManager` if heavy work is added after navigation transitions

### 8.6 Bundle and Startup
- [REC: later] Confirm Hermes / new architecture settings in Expo config when preparing builds
- [REC: later] Review imports for bundle size issues before production
- [REC: later] Consider lazy-loading heavy screens only if app grows significantly

### 8.7 Build and Release
- [REC: later] Decide when to add `eas.json`
- [REC: later] Configure EAS build profiles when project is ready for tester distribution
- [REC: later] Review tree-shaking guidance based on actual Expo SDK version
- [REC: later] Run bundle-size analysis before production build

## Notes
- Ignore device mockup framing from `.pen` file, including black outer device frame and fake status bar rows used only for presentation.
- Implement only actual in-app UI.
- Treat `expo-best-practices.md` as an adoption reference, not a requirement to install every library immediately.
- Keep `@react-native-community/datetimepicker` for now because it works in Expo Go.
- Consider `@expo/ui` date picker later only if the team switches to a dev client and wants platform-specific modern picker styling.
- Frontend package manager is `pnpm`; prefer `pnpm` commands going forward.
- Current route groups confirmed:
  - `app/index.tsx`
  - `app/(auth)/sign-in.tsx`
  - `app/(auth)/sign-up.tsx`
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/documents.tsx`
  - `app/(tabs)/profile.tsx`
  - `app/upload.tsx`
  - `app/document/[id].tsx`
  - `app/verify/[id].tsx`
- Current next target:
  - `Upload actions: file picker, camera capture, type select`
