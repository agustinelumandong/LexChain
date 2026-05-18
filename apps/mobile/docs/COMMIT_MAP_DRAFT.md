# Commit Map Draft

Detailed commit breakdown with suggested Conventional Commit messages.

## Synchronization Plan (Uncommitted + Already Committed)

Use this section to keep the commit map aligned with real git history over time.

### Current repository snapshot (for this map)

This commit map is tracking a **filtered scope** (excluding `.gitignore`, markdown/docs, images, design files, json/yaml config-only items, and `.codex/`).

- Uncommitted files in this tracked scope: **55**
  - Modified: **9**
  - Deleted: **1**
  - Untracked: **45**
- Commit-history coverage of mapped paths:
  - Paths with prior commit history: **10**
  - Brand-new paths with no history yet: **45**
- Branch state snapshot:
  - Current branch: **`dev`**
  - Upstream for `dev`: **none configured**
  - `dev` vs local `main`: **ahead 11**, behind 0
  - `dev` vs `origin/main`: **ahead 28**, behind 0

> Note: “has prior commit history” means a file existed in past commits; it does **not** mean current local changes are already pushed.

### Branch model

- `main` → production-ready only (stable/deployable)
- `dev` → active integration branch
- `feature/*` → short-lived feature branches
- `fix/*` → bug-fix branches

### Rules

1. One map item = one commit intent.
2. Every new commit should reference a map ID in the commit body/footer.
3. If a map item is already committed, record its SHA and mark status as `committed`.
4. If only some files of a map item were committed, mark status as `partial`.
5. Do not rewrite shared branch history unless explicitly planned.

### Status values

- `uncommitted` = not committed yet
- `partial` = some files committed, some still pending
- `committed` = fully committed and traceable to SHA
- `deferred` = intentionally postponed

### Tracking table template

| Map ID | Scope | Branch | Status | Commit SHA | PR | Notes |
|---|---|---|---|---|---|---|
| 1 | Auth layout shell cleanup | feature/auth-polish | uncommitted | - | - | |
| 2 | Sign-in screen UX adjustments | feature/auth-polish | uncommitted | - | - | |
| 3 | Sign-up screen UX adjustments | feature/auth-polish | uncommitted | - | - | |
| 4 | Shared auth input component improvements | feature/auth-polish | uncommitted | - | - | |
| 5 | Terms bottom sheet behavior cleanup | feature/auth-polish | uncommitted | - | - | |
| 6 | Tab navigator structure cleanup | fix/navigation-shell | uncommitted | - | - | |
| 7 | Home tab updates (existing screen only) | fix/navigation-shell | uncommitted | - | - | |
| 8 | Remove deprecated explore tab | fix/navigation-shell | uncommitted | - | - | |
| 9 | Shared button primitive refinement | fix/ui-button | uncommitted | - | - | |
| 10 | Add forgot password entry point | feature/auth-forgot-password | uncommitted | - | - | |
| 11 | Upload flow shell screens | feature/upload-flow | uncommitted | - | - | |
| 12 | Camera capture/review screens | feature/upload-flow | uncommitted | - | - | |
| 13 | Upload UI primitives/cards | feature/upload-flow | uncommitted | - | - | |
| 14 | Upload domain/session helpers | feature/upload-flow | uncommitted | - | - | |
| 15 | Document detail route + verify route | feature/document-detail | uncommitted | - | - | |
| 16 | Document detail view components (core cards) | feature/document-detail | uncommitted | - | - | |
| 17 | Document actions + preview + verify sheets | feature/document-detail | uncommitted | - | - | |
| 18 | Whitelist management components | feature/document-detail | uncommitted | - | - | |
| 19 | Documents tab route + listing shell | feature/documents-tab | uncommitted | - | - | |
| 20 | Documents filtering/sorting/search controls | feature/documents-tab | uncommitted | - | - | |
| 21 | Profile tab route + profile cards | feature/profile-tab | uncommitted | - | - | |
| 22 | Shared navigation/search/select primitives | feature/shared-ui-primitives | uncommitted | - | - | |

### Reconciliation loop (recommended)

Run this after each work session:

1. Compare `git status` with this map.
2. Compare `git log --name-only --oneline` with map items.
3. Update `Status`, `Commit SHA`, and `PR` columns.
4. Mark split commits as `partial` and add notes.
5. Keep `main` clean: merge only from `dev` when stable.

### Already committed sync policy

If a map item was already committed before this document:

- Add the known SHA immediately.
- Mark as `committed` (or `partial` if incomplete).
- Do not force-rewrite shared history just to match the map.
- Use forward commits to complete missing parts.

## 1) Auth layout shell cleanup

**Files**
- `frontend/app/(auth)/_layout.tsx`

**Message**
- `refactor(auth-layout): simplify auth stack container structure`

---

## 2) Sign-in screen UX adjustments

**Files**
- `frontend/app/(auth)/sign-in.tsx`

**Message**
- `refactor(auth): improve sign-in screen interactions and field flow`

---

## 3) Sign-up screen UX adjustments

**Files**
- `frontend/app/(auth)/sign-up.tsx`

**Message**
- `refactor(auth): refine sign-up screen layout and input handling`

---

## 4) Shared auth input component improvements

**Files**
- `frontend/src/features/auth/auth-input.tsx`

**Message**
- `refactor(auth-ui): standardize auth input behavior and styling`

---

## 5) Terms bottom sheet behavior cleanup

**Files**
- `frontend/src/features/auth/terms-bottom-sheet.tsx`

**Message**
- `refactor(auth-ui): tighten terms sheet interactions and presentation`

---

## 6) Tab navigator structure cleanup

**Files**
- `frontend/app/(tabs)/_layout.tsx`
- `frontend/app/_layout.tsx`

**Message**
- `chore(navigation): align root and tabs layout configuration`

---

## 7) Home tab updates (existing screen only)

**Files**
- `frontend/app/(tabs)/index.tsx`

**Message**
- `refactor(home): update tab home composition without feature expansion`

---

## 8) Remove deprecated explore tab

**Files**
- `frontend/app/(tabs)/explore.tsx` *(deleted)*

**Message**
- `chore(tabs): remove deprecated explore tab screen`

---

## 9) Shared button primitive refinement

**Files**
- `frontend/src/shared/components/ui/button.tsx`

**Message**
- `refactor(ui): refine button primitive states and consistency`

---

## New-feature commits (separate lane)

## 10) Add forgot password entry point

**Files**
- `frontend/app/(auth)/forgot-password.tsx`

**Message**
- `feat(auth): add forgot-password screen entry flow`

---

## 11) Upload flow shell screens

**Files**
- `frontend/app/upload.tsx`
- `frontend/app/processing.tsx`

**Message**
- `feat(upload): add upload and processing flow screens`

---

## 12) Camera capture/review screens

**Files**
- `frontend/app/camera-capture.tsx`
- `frontend/app/capture-review.tsx`

**Message**
- `feat(capture): add camera capture and review screens`

---

## 13) Upload UI primitives/cards

**Files**
- `frontend/src/features/upload/upload-header.tsx`
- `frontend/src/features/upload/upload-top-bar.tsx`
- `frontend/src/features/upload/upload-dropzone-card.tsx`
- `frontend/src/features/upload/upload-reference-field.tsx`
- `frontend/src/features/upload/upload-select-field.tsx`
- `frontend/src/features/upload/upload-type-bottom-sheet.tsx`
- `frontend/src/features/upload/ai-summary-draft-card.tsx`

**Message**
- `feat(upload-ui): add reusable upload flow UI components`

---

## 14) Upload domain/session helpers

**Files**
- `frontend/src/features/upload/upload-file.ts`
- `frontend/src/features/upload/upload-session.ts`

**Message**
- `feat(upload-data): add upload file/session utility layer`

---

## 15) Document detail route + verify route

**Files**
- `frontend/app/document/[id].tsx`
- `frontend/app/verify/[id].tsx`

**Message**
- `feat(document): add document detail and verify routes`

---

## 16) Document detail view components (core cards)

**Files**
- `frontend/src/features/document/components/document-screen-header.tsx`
- `frontend/src/features/document/components/document-top-bar.tsx`
- `frontend/src/features/document/components/document-summary-card.tsx`
- `frontend/src/features/document/components/detail-sections-card.tsx`
- `frontend/src/features/document/components/verification-status-card.tsx`
- `frontend/src/features/document/components/integrity-check-card.tsx`

**Message**
- `feat(document-ui): add document detail status and summary components`

---

## 17) Document actions + preview + verify sheets

**Files**
- `frontend/src/features/document/components/document-actions-sheet.tsx`
- `frontend/src/features/document/components/document-preview-bottom-sheet.tsx`
- `frontend/src/features/document/components/verify-document-bottom-sheet.tsx`

**Message**
- `feat(document-actions): add preview, action, and verify bottom sheets`

---

## 18) Whitelist management components

**Files**
- `frontend/src/features/document/components/access-whitelist-card.tsx`
- `frontend/src/features/document/components/manage-whitelist-bottom-sheet.tsx`
- `frontend/src/features/document/components/whitelist-grant-row.tsx`
- `frontend/src/features/document/components/whitelist-search-result-row.tsx`

**Message**
- `feat(document-whitelist): add whitelist access and management UI`

---

## 19) Documents tab route + listing shell

**Files**
- `frontend/app/(tabs)/documents.tsx`
- `frontend/src/features/documents/documents-header.tsx`
- `frontend/src/features/documents/document-result-card.tsx`

**Message**
- `feat(documents): add documents tab and result list shell`

---

## 20) Documents filtering/sorting/search controls

**Files**
- `frontend/src/features/documents/documents-filter-controls.tsx`
- `frontend/src/features/documents/documents-filter-sheet.tsx`
- `frontend/src/features/documents/documents-sort-sheet.tsx`
- `frontend/src/features/documents/documents-search-field.tsx`

**Message**
- `feat(documents-filters): add search, sort, and filter interactions`

---

## 21) Profile tab route + profile cards

**Files**
- `frontend/app/(tabs)/profile.tsx`
- `frontend/src/features/profile/profile-header.tsx`
- `frontend/src/features/profile/profile-summary-card.tsx`
- `frontend/src/features/profile/profile-metrics-card.tsx`
- `frontend/src/features/profile/settings-list-card.tsx`

**Message**
- `feat(profile): add profile tab with summary, metrics, and settings`

---

## 22) Shared navigation/search/select primitives

**Files**
- `frontend/src/shared/components/ui/bottom-nav.tsx`
- `frontend/src/shared/components/ui/search-input-with-results.tsx`
- `frontend/src/shared/components/ui/select-dropdown-field.tsx`
- `frontend/src/shared/hooks/use-close-sheet-on-back.ts`

**Message**
- `feat(shared-ui): add bottom nav, searchable input, select field, and back-close hook`
