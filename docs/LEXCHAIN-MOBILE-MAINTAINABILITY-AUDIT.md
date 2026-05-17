# LexChain Mobile Maintainability and Architecture Audit

Last updated: 2026-05-17

Scope:

```txt
apps/mobile/app
apps/mobile/src
```

This is a read-only first-pass audit. No app refactor has been applied yet.

## Summary

The mobile app already has a mostly clean feature direction:

```txt
src/features
src/shared
src/services/api
src/services/query
```

Main maintainability problem:

```txt
Expo Router route files still contain too much real screen implementation.
```

Most urgent issue is the document detail route:

```txt
apps/mobile/app/document/[id].tsx
```

It is now a critical file because it owns UI, data fetching, mutations, formatting, sheet orchestration, navigation, toasts, and styles in one place.

## Large Files

| File path | Lines | Severity | Problem |
|---|---:|---|---|
| `apps/mobile/app/document/[id].tsx` | 1091 | critical | Document detail UI, formatters, version mapping, permission UI, 8+ query/mutations, sheet orchestration, toast/error handling, styles |
| `apps/mobile/src/features/document/components/manage-whitelist-bottom-sheet.tsx` | 718 | high | Main whitelist sheet, nested grant sheet, role dropdown, revoke countdown, filtering, back handling, styles |
| `apps/mobile/app/document/menu.tsx` | 639 | high | Route screen, menu rows, update PDF sheet, file picker, whitelist mutations, rename, styles |
| `apps/mobile/src/features/document/components/ask-document-sheet.tsx` | 522 | high | Chat state, composer, keyboard animation, sheet lifecycle, message rendering, styles |
| `apps/mobile/app/upload.tsx` | 494 | medium | Upload UI, PDF validation, picker/share logic, scan PDF conversion, whitelist demo state, mutation/toasts |
| `apps/mobile/app/(tabs)/documents.tsx` | 444 | medium | Screen state, backend search query, filtering/sorting, mapping, error toast, list render |
| `apps/mobile/app/processing.tsx` | 443 | medium | Polling query, fake progress engine, progress UI, completion haptics, styles |
| `apps/mobile/app/camera-capture.tsx` | 439 | medium | Camera permissions, capture queue, file building, preview UI, scanner controls, styles |
| `apps/mobile/app/(auth)/sign-up.tsx` | 439 | medium | Form state, validation, password strength, invite params, terms sheet, mutation/toasts |
| `apps/mobile/src/features/documents/documents-filter-sheet.tsx` | 427 | medium | Filter UI, date modal, local selected state, dropdowns, styles |
| `apps/mobile/src/shared/components/ui/button.tsx` | 390 | medium | Many variants, image/icon states, sizes, disabled styles |
| `apps/mobile/src/features/auth/terms-bottom-sheet.tsx` | 384 | medium | Legal content, sheet mechanics, accept flow, styles |
| `apps/mobile/src/features/documents/data/mock-documents.ts` | 349 | medium | Static mock dataset |
| `apps/mobile/src/features/document/components/rename-document-sheet.tsx` | 349 | medium | Rename form, validation, sheet lifecycle, styles |
| `apps/mobile/app/document/pdf-viewer.tsx` | 341 | medium | Route params, tools sheet, PDF rendering, fallback actions, styles |
| `apps/mobile/src/features/document/components/detail-sections-card.tsx` | 338 | medium | Generic card plus risk-specific rendering |
| `apps/mobile/src/features/profile/profile-detail-screen.tsx` | 313 | medium | Reusable profile layout but carries full style system |
| `apps/mobile/src/features/document/components/ask-document-card.tsx` | 312 | medium | Card, empty/loading states, action layout |
| `apps/mobile/app/capture-review.tsx` | 312 | medium | Queue review UI, delete modal, upload session operations |
| `apps/mobile/src/services/api/mock/documents.mock.ts` | 302 | medium | Mock API behavior |

## Issues

### 1. Document Detail Route Is Critical

File path:

```txt
apps/mobile/app/document/[id].tsx
```

Severity:

```txt
critical
```

Problem:

```txt
The screen owns document data fetch, version/metadata formatting, whitelist mutations, sheet state, navigation, toast handling, and local card components.
```

Why it matters:

```txt
Every document feature change risks this file.
Testing and review become hard because business logic, presentation, and effects are mixed.
```

Recommended refactor:

```txt
Extract:
- DocumentDetailsScreen container
- useDocumentDetailsController
- document-formatters.ts
- document-version-history.ts
- DocumentStatusCard
- AccessControlCard
- VersionHistoryCard
```

Suggested target folder/file:

```txt
src/features/document/screens/document-details-screen.tsx
src/features/document/hooks/use-document-details-controller.ts
src/features/document/utils/document-formatters.ts
src/features/document/utils/document-version-history.ts
src/features/document/components/cards/
```

Safe to refactor now:

```txt
Yes, but do it in small slices.
```

### 2. Whitelist Sheet Is Too Large

File path:

```txt
apps/mobile/src/features/document/components/manage-whitelist-bottom-sheet.tsx
```

Severity:

```txt
high
```

Problem:

```txt
One component owns two bottom sheets, filtering, revoke timer, role dropdown, back handling, empty state, skeleton state, and styles.
```

Why it matters:

```txt
Access rules are important. A large sheet makes permission UI harder to modify safely.
```

Recommended refactor:

```txt
Split into:
- WhitelistMainSheet
- WhitelistGrantActionsSheet
- useWhitelistSheetState
- whitelist-labels.ts
```

Suggested target folder/file:

```txt
src/features/document/components/whitelist/
src/features/document/hooks/use-whitelist-sheet-state.ts
src/features/document/utils/whitelist-labels.ts
```

Safe to refactor now:

```txt
Yes, but preserve existing BottomSheet import rules and keyboard/back behavior.
```

### 3. Document Menu Route Mixes Actions and Sheet UI

File path:

```txt
apps/mobile/app/document/menu.tsx
```

Severity:

```txt
high
```

Problem:

```txt
The route embeds update-document sheet, PDF picking, upload mutation, rename mutation, whitelist mutation, and menu UI.
```

Why it matters:

```txt
Document actions now exist in more than one screen, so behavior can drift.
```

Recommended refactor:

```txt
Move UpdateDocumentSheet out.
Create a document actions controller hook.
Reuse whitelist access action logic with document detail.
```

Suggested target folder/file:

```txt
src/features/document/screens/document-menu-screen.tsx
src/features/document/components/update-document-sheet.tsx
src/features/document/hooks/use-document-access-actions.ts
src/features/document/hooks/use-document-update-action.ts
```

Safe to refactor now:

```txt
Yes.
```

### 4. Ask Document Sheet Mixes Chat, Keyboard, and Sheet Lifecycle

File path:

```txt
apps/mobile/src/features/document/components/ask-document-sheet.tsx
```

Severity:

```txt
high
```

Problem:

```txt
The component owns chat messages, composer state, keyboard animation, scroll-to-end behavior, sheet lifecycle, and message rendering.
```

Why it matters:

```txt
Keyboard behavior is fragile. Chat UI changes can accidentally break input focus or bottom-sheet position.
```

Recommended refactor:

```txt
Keep AskComposer stable.
Extract:
- useAskDocumentChat
- AskMessageList
- AskSheetHeader
```

Suggested target folder/file:

```txt
src/features/document/components/ask/
src/features/document/hooks/use-ask-document-chat.ts
```

Safe to refactor now:

```txt
Medium risk. Refactor only after a focused screenshot/manual keyboard test plan.
```

### 5. Upload Screen Owns Too Much Flow Logic

File path:

```txt
apps/mobile/app/upload.tsx
```

Severity:

```txt
medium
```

Problem:

```txt
Upload route owns PDF validation, picker/share logic, scan PDF conversion, mutation, navigation, haptics, toasts, and leftover whitelist demo state.
```

Why it matters:

```txt
Upload bugs become hard to isolate because file utilities and UI state are mixed.
```

Recommended refactor:

```txt
Extract:
- useUploadFlow
- upload-file-utils.ts
- upload validation helpers
- remove or isolate whitelist draft state
```

Suggested target folder/file:

```txt
src/features/upload/screens/upload-screen.tsx
src/features/upload/hooks/use-upload-flow.ts
src/features/upload/utils/file-validation.ts
```

Safe to refactor now:

```txt
Yes.
```

### 6. Documents Screen Bypasses Query Layer

File path:

```txt
apps/mobile/app/(tabs)/documents.tsx
```

Severity:

```txt
medium
```

Problem:

```txt
The screen uses React Query directly and calls fetchSearchResultsWithDetails from the API module.
It also owns list mapping, debouncing, filtering, sorting, error toast, and row rendering.
```

Why it matters:

```txt
The app already has services/query as a pattern. This screen bypasses it and makes search harder to reuse.
```

Recommended refactor:

```txt
Extract:
- useDocumentsScreen
- useDocumentSearch
- document-list-mappers.ts
- document-list-filters.ts
```

Suggested target folder/file:

```txt
src/features/documents/screens/documents-screen.tsx
src/features/documents/hooks/use-documents-screen.ts
src/features/documents/hooks/use-document-search.ts
src/features/documents/utils/document-list-mappers.ts
```

Safe to refactor now:

```txt
Yes.
```

### 7. Processing Screen Has Direct Query and Progress Engine

File path:

```txt
apps/mobile/app/processing.tsx
```

Severity:

```txt
medium
```

Problem:

```txt
The route owns polling query, fake progress timing, status steps, completion haptic, and UI.
```

Why it matters:

```txt
Polling behavior and progress simulation should be independently testable.
```

Recommended refactor:

```txt
Use existing useDocument query hook.
Extract useProcessingProgress.
```

Suggested target folder/file:

```txt
src/features/upload/screens/processing-screen.tsx
src/features/upload/hooks/use-processing-progress.ts
```

Safe to refactor now:

```txt
Yes.
```

### 8. Repeated PDF and File Formatting Logic

File paths:

```txt
apps/mobile/app/upload.tsx
apps/mobile/app/document/menu.tsx
apps/mobile/app/camera-capture.tsx
```

Severity:

```txt
medium
```

Problem:

```txt
PDF validation and file-size formatting are repeated.
```

Why it matters:

```txt
Validation can drift between upload and document update flows.
```

Recommended refactor:

```txt
Create shared file helpers.
```

Suggested target folder/file:

```txt
src/shared/utils/file.ts
```

or feature-local:

```txt
src/features/upload/utils/file-validation.ts
```

Safe to refactor now:

```txt
Yes.
```

### 9. Repeated Date and Status Formatting

File paths:

```txt
apps/mobile/app/document/[id].tsx
apps/mobile/app/(tabs)/documents.tsx
apps/mobile/app/verify/[id].tsx
apps/mobile/src/features/dashboard/dashboard-recent-list.tsx
```

Severity:

```txt
medium
```

Problem:

```txt
formatDate and status mapping appear in multiple places.
```

Why it matters:

```txt
Document labels can become inconsistent across dashboard, list, detail, and verifier screens.
```

Recommended refactor:

```txt
Extract shared date formatting and document-specific status formatting.
```

Suggested target folder/file:

```txt
src/shared/utils/date.ts
src/features/document/utils/document-status.ts
```

Safe to refactor now:

```txt
Yes.
```

### 10. Repeated Toast and Error Handling

File paths:

```txt
apps/mobile/app/upload.tsx
apps/mobile/app/document/[id].tsx
apps/mobile/app/document/menu.tsx
apps/mobile/app/(tabs)/documents.tsx
apps/mobile/app/(auth)/sign-in.tsx
apps/mobile/app/(auth)/sign-up.tsx
```

Severity:

```txt
medium
```

Problem:

```txt
parseApiError + toast.error + Haptics.notificationAsync is repeated.
```

Why it matters:

```txt
Error UX can drift. Every mutation repeats boilerplate.
```

Recommended refactor:

```txt
Use existing useErrorToast more widely.
Add a helper for haptic error toasts if needed.
```

Suggested target folder/file:

```txt
src/shared/hooks/use-error-toast.ts
src/shared/utils/toast.ts
```

Safe to refactor now:

```txt
Yes.
```

### 11. Repeated Card Styles and Hardcoded Tokens

File paths:

```txt
apps/mobile/app/document/[id].tsx
apps/mobile/app/processing.tsx
apps/mobile/app/document/menu.tsx
apps/mobile/src/features/dashboard/dashboard-kpi-card.tsx
apps/mobile/src/features/profile/profile-summary-card.tsx
apps/mobile/src/features/document/components/*.tsx
```

Severity:

```txt
medium
```

Problem:

```txt
Repeated card styles:
- borderRadius: 24
- shadowOpacity: 0.06
- white surface
- navy shadow
- hardcoded success/error/warning colors
```

Why it matters:

```txt
Visual changes require many edits and risk inconsistent UI.
```

Recommended refactor:

```txt
Add theme tokens for card radius, shadows, and semantic colors.
```

Suggested target folder/file:

```txt
src/shared/theme/theme.ts
src/shared/theme/tokens.ts
```

Safe to refactor now:

```txt
Yes, but run visual checks after.
```

### 12. Route Files Are Too Heavy

File paths:

```txt
apps/mobile/app/document/[id].tsx
apps/mobile/app/upload.tsx
apps/mobile/app/processing.tsx
apps/mobile/app/camera-capture.tsx
apps/mobile/app/(tabs)/documents.tsx
```

Severity:

```txt
medium
```

Problem:

```txt
Expo Router files contain full implementation instead of thin wrappers.
```

Why it matters:

```txt
Navigation tree becomes harder to scan.
Feature ownership becomes unclear.
```

Recommended refactor:

```txt
Keep route files as wrappers that export feature screens.
```

Suggested target folder/file:

```txt
apps/mobile/app/document/[id].tsx
src/features/document/screens/document-details-screen.tsx
```

Example final route wrapper:

```tsx
export { default } from '@/features/document/screens/document-details-screen';
```

Safe to refactor now:

```txt
Yes, one route at a time.
```

## Component Problems

### Too Large or Mixed Components

```txt
ManageWhitelistBottomSheet
AskDocumentSheet
RenameDocumentSheet
DetailSectionsCard
Button
```

Recommended direction:

```txt
Large sheets should split state/hooks from rendering.
Generic UI components should not know feature-specific copy or rules.
Feature-specific cards should stay inside their feature.
```

### Components That Are Too Feature-Specific for Shared

Current shared UI looks mostly okay. Biggest shared component to watch:

```txt
src/shared/components/ui/button.tsx
```

It is not wrong to be large, but variants/styles should be easier to scan.

Recommended direction:

```txt
Keep public Button API stable.
Move variant style maps into a separate file if it grows again.
```

## Hook Problems

Current hooks are not extremely large:

```txt
src/features/documents/use-documents-store.ts       155 lines
src/services/query/use-documents.ts                150 lines
src/services/query/use-admin.ts                     61 lines
```

Problem:

```txt
Some screens need hooks but do not have them yet.
The complexity lives in screens instead of hooks.
```

Recommended new hooks:

```txt
useDocumentDetailsController
useDocumentAccessActions
useDocumentsScreen
useDocumentSearch
useUploadFlow
useProcessingProgress
useAskDocumentChat
useWhitelistSheetState
```

## Duplicate Logic

Found duplicates:

```txt
date formatting
status label formatting
file size formatting
PDF validation
toast/error handling
haptic error feedback
card shadows/radius
button rows
empty/loading states
bottom-sheet handle/backdrop styles
```

Recommended shared targets:

```txt
src/shared/utils/date.ts
src/shared/utils/file.ts
src/shared/hooks/use-error-toast.ts
src/shared/theme/theme.ts
src/shared/components/ui/query-states.tsx
```

## Feature Organization

Current organization is already close:

```txt
src/features/auth
src/features/dashboard
src/features/document
src/features/documents
src/features/profile
src/features/upload
src/shared
src/services
```

Main gap:

```txt
features do not consistently have screens/hooks/utils/types/constants folders.
```

Preferred direction:

```txt
src/
  features/
    document/
      components/
      screens/
      hooks/
      utils/
      types/
      constants/
    auth/
    verification/
    profile/
    upload/
    documents/
  shared/
    components/
    hooks/
    utils/
    theme/
  services/
    api/
    query/
```

## Import Boundaries

Good current boundaries:

```txt
shared components mostly do not depend on features
API client is under services/api
React Query hooks mostly under services/query
theme imported from shared alias
```

Boundary risks:

```txt
features/documents/use-documents-store imports from features/document
app/(tabs)/documents.tsx imports API function directly
app/processing.tsx imports documentsApi directly
route files import many feature internals
```

Recommended rules:

```txt
shared must never import features
features may import shared
features should avoid importing sibling feature internals unless the dependency is intentional
screens should use hooks/query wrappers instead of raw API functions
route files should import screens only
```

## Performance Risks

Found risks:

```txt
DocumentsScreen maps and filters arrays during render.
DocumentsScreen creates activeFilterSummary array during render.
DocumentDetailsScreen builds row arrays inline for DocumentSummaryCard.
ManageWhitelistBottomSheet filters search results during render.
Several screens pass inline callbacks and objects into child components.
Many ScrollView screens are okay because content is small, but long document detail sections may grow.
```

Recommendations:

```txt
Use useMemo for expensive mapped/filtered lists.
Move list transforms into hooks.
Keep FlatList for documents list.
Consider FlatList/SectionList if document detail sections become long.
Do not add React.memo everywhere. Use it only for repeated list rows or expensive stable children.
```

## Style Maintainability

Main issue:

```txt
Repeated StyleSheet blocks with duplicated card patterns.
Hardcoded colors still appear in several files.
```

Recommended theme additions:

```txt
APP_SPACING
APP_RADII
APP_SHADOWS
APP_STATUS_COLORS
```

Example target:

```ts
export const APP_RADII = {
  card: 24,
  sheet: 28,
  pill: 999,
};

export const APP_SHADOWS = {
  card: {
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};
```

## API and Query Structure

Good:

```txt
services/api exists
services/query exists
query keys are centralized
most API work goes through query hooks
```

Problems:

```txt
DocumentsScreen uses useQuery directly.
ProcessingScreen uses useQuery directly.
Mutation error handling is repeated in screens.
```

Recommended direction:

```txt
Keep API functions in services/api.
Keep React Query wrappers in services/query or feature hooks.
Keep screens focused on rendering and navigation.
```

## Top 10 Highest-Priority Cleanup Tasks

1. Split `apps/mobile/app/document/[id].tsx` into screen, controller hook, components, and utils.
2. Extract shared document formatters: date, status, reference, content type.
3. Extract shared file utilities: PDF validation, file-size formatting, picker asset mapping.
4. Move document list query/search/filter/sort into `features/documents/hooks`.
5. Move update-document sheet out of `apps/mobile/app/document/menu.tsx`.
6. Split whitelist sheet into main sheet, grant actions sheet, and hook.
7. Standardize toast/error handling with `useErrorToast`.
8. Extract processing progress engine into a hook.
9. Add theme tokens for card, shadow, radius, and status colors.
10. Keep route files thin by moving real screens into feature `screens/` folders.

## Safe Refactor Order

1. Pure utils first: date, status, file formatting.
2. Error toast helper adoption.
3. Document list hook extraction.
4. Upload hook extraction.
5. Processing progress hook extraction.
6. Document menu sheet extraction.
7. Whitelist sheet split.
8. Document detail route split.
9. Theme token cleanup.
10. Bigger folder moves and barrel cleanup.

## Files That Should Not Be Touched Yet

```txt
apps/mobile/app/verify/[id].tsx
```

Reason:

```txt
This mobile verifier route must stay stable and separate from public web verification.
```

```txt
apps/mobile/src/services/api/generated/
packages/types/src/generated/
```

Reason:

```txt
Generated files should not be hand-edited.
```

```txt
apps/mobile/src/features/document/components/ask-document-sheet.tsx
```

Reason:

```txt
Keyboard and bottom-sheet behavior are fragile. Refactor only with focused manual testing.
```

```txt
apps/mobile/android/
apps/mobile/ios/
apps/mobile/eas.json
```

Reason:

```txt
Native/build config is outside this maintainability cleanup.
```

```txt
apps/web/
```

Reason:

```txt
Next.js web app is separate from Expo mobile refactor.
```

## Proposed Final Folder Structure

```txt
apps/mobile/src/
  features/
    document/
      screens/
        document-details-screen.tsx
        document-menu-screen.tsx
        document-pdf-viewer-screen.tsx
      components/
        cards/
        sheets/
        whitelist/
        ask/
      hooks/
        use-document-details-controller.ts
        use-document-access-actions.ts
      utils/
        document-formatters.ts
        document-version-history.ts
        document-status.ts
      types/
      constants/

    documents/
      screens/
        documents-screen.tsx
      components/
      hooks/
        use-documents-screen.ts
        use-document-search.ts
      utils/
        document-list-mappers.ts
        document-list-filters.ts
      types/
      constants/

    upload/
      screens/
        upload-screen.tsx
        processing-screen.tsx
        camera-capture-screen.tsx
        capture-review-screen.tsx
      components/
      hooks/
        use-upload-flow.ts
        use-processing-progress.ts
      utils/
        file-validation.ts
      types/
      constants/

    auth/
      components/
      screens/
      hooks/
      utils/
      schemas/

    verification/
      components/
      screens/
      hooks/
      utils/

    profile/
      components/
      screens/
      hooks/
      utils/

  shared/
    components/
    hooks/
    utils/
      date.ts
      file.ts
      toast.ts
    theme/
      theme.ts
      tokens.ts

  services/
    api/
    query/
```

## Migration Plan

### Rule

Keep Expo Router paths unchanged.

Route files should slowly become thin wrappers:

```tsx
export { default } from '@/features/document/screens/document-details-screen';
```

### Step 1: Extract Pure Utilities

Move duplicated pure functions first:

```txt
formatDate
formatStatusLabel
formatReference
formatContentType
formatFileSize
isPdfFile
```

Why first:

```txt
Low risk. No UI behavior changes.
```

### Step 2: Extract Query and Controller Hooks

Create screen hooks:

```txt
useDocumentsScreen
useUploadFlow
useProcessingProgress
useDocumentDetailsController
```

Why second:

```txt
It reduces screen size without changing UI components yet.
```

### Step 3: Move Screen Implementations Out of Route Files

For each route:

```txt
create feature screen file
move implementation
leave app route wrapper
run lint
manual smoke test route
```

Start with:

```txt
processing
documents
upload
document menu
document detail
```

### Step 4: Split Large Sheets

Split:

```txt
ManageWhitelistBottomSheet
AskDocumentSheet
RenameDocumentSheet if still painful
```

Why later:

```txt
BottomSheet behavior is fragile. Do it after easier refactors reduce noise.
```

### Step 5: Theme Token Cleanup

Move repeated visual constants into:

```txt
shared/theme/tokens.ts
```

Run visual checks after.

### Step 6: Stop After Each Slice

After every slice:

```bash
pnpm run lint
```

Manual smoke routes:

```txt
/(tabs)/documents
/upload
/camera-capture
/processing
/document/[id]
/document/menu
/document/pdf-viewer
/verify/[id]
```

## Final Notes

The current codebase is not broken. It is at the stage where feature growth made some route files and bottom sheets too dense.

Best next cleanup:

```txt
Extract pure document/file/date utilities first.
Then split DocumentDetailsScreen.
```

Do not start with a full folder migration. Do small safe moves and keep Expo Router paths stable.
