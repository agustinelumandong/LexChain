# Task 5 report: portal page request recovery

## Scope and implementation

- Migrated the listed page-level `/api/portal/proxy` reads in document list/detail/activity/review/viewer/upload/processing, dashboard, and portal shell to `portalRequest`.
- Kept request URLs, methods, bodies, cache settings, and success parsing intact. The only direct fetches remaining in these files are the explicitly excluded `/api/admin/dashboard` request and logout request.
- Preserved the existing 401/403/404 presentation in document detail and library views. Recoverable request errors now expose the shared backend message in the library, detail, viewer, activity, review, processing, and dashboard error states.
- Associated upload `details.errors` for supported title, book, document number, and page number fields with the controls using inline text and `aria-invalid` / `aria-describedby`. Unknown or unassociated messages remain in the form-level summary. Existing selected file and values remain controlled state after a rejected upload.
- Updated review and processing page error assertions to verify backend messages.

## TDD evidence

- **RED:** Added a document-library regression asserting a backend 503 `message` is displayed. Before migration the test failed because the screen displayed only “Unable to load documents.”
- **GREEN:** Migrated the document request to `portalRequest` and surfaced its `PortalApiError.message`; the assertion passed. Upload tests now also assert field association, unmatched/unassociated summary messages, and retained input values.

## Verification

- Full Vitest: `pnpm exec vitest run --testTimeout=15000 --maxWorkers=2` — **92 files, 689 tests passed**.
- Focused post-change rerun: upload, review-route, and processing-route tests — **3 files, 30 tests passed**.
- Earlier focused run of the document page, document detail, upload, dashboard, and review tests — **5 files, 48 tests passed**.
- `pnpm typecheck`, `pnpm lint`, and `git diff --check` passed after the implementation and before the final test-only expectation addition; those checks were rerun after that addition and completed successfully.
- The first full Vitest run with a 10-second timeout had 688/689 passing; the unrelated `issuer-management-mock-mode.test.ts` exceeded 10 seconds under that run. With two workers and a 15-second timeout, all tests passed; the affected test took 2.7 seconds.

## Scope note

### Review follow-up

The review identified three accessibility/error-reporting gaps and they are now fixed in the follow-up commit:

- Added an `ariaDescribedBy` prop to `PortalDropdown` and forwarded it to the trigger button. The upload book error now reaches the control that receives focus.
- `getUploadValidationErrors` now preserves unreadable entries with the safe message “The backend returned an unreadable validation error.” Page coverage confirms the malformed item appears in the form-level summary.
- Multiple errors for one upload field now share a single described error container ID, while each message remains readable inside it.

**RED:** Added tests first; parser fallback expected entries but got an empty array, dropdown forwarding returned no description attribute, and upload markup contained duplicate `upload-doc-no-error` IDs. **GREEN:** All three now pass after the focused implementation.

Follow-up verification: `pnpm exec vitest run src/features/portal/components/portal-dropdown.test.tsx src/features/documents/portal-upload.test.ts src/features/documents/pages/upload-page.test.tsx` — **3 files, 28 tests passed**; `pnpm typecheck`, `pnpm lint`, and `git diff --check` also passed.

### Duplicate message key follow-up

The rendered upload field-error lists now include the stable response-list index in each React key, so repeated identical backend messages render without key collisions. The upload regression includes a repeated `doc_no` message and asserts both copies remain visible. Focused verification: `pnpm exec vitest run src/features/documents/pages/upload-page.test.tsx` — **1 file, 9 tests passed**; `git diff --check` passed.

### Recovery summary key follow-up

The confirmation/recovery validation summary now includes the list index in each key as well. Its test returns two identical `file_name` validation entries, checks that both render, and verifies React emitted no duplicate-key warning. **RED:** The new assertion observed a duplicate-key warning before the key change. **GREEN:** The focused upload suite passes (1 file, 9 tests); `git diff --check` passes.

### Upload error-source follow-up

The final review added three upload regressions and corresponding fixes:

- Document/page number errors go into the form summary when manual-number controls are not rendered; when controls are available, those errors stay associated with the controls.
- Field and summary validation now read from the active failed mutation. The initial `UploadRequestError` remains available in the recovery choice panel, so its recovery choices and original validation detail are retained after attachment failure.
- Ordinary summary entries include their response-list index in React keys, covering distinct malformed values that receive the same safe fallback text.

**RED:** The new tests initially failed because the hidden `doc_no` error was omitted, the attachment error details were not shown, and repeated malformed fallback entries generated a duplicate-key warning. **GREEN:** `pnpm exec vitest run src/features/documents/pages/upload-page.test.tsx` passed (**1 file, 11 tests**). `pnpm typecheck`, `pnpm lint`, and `git diff --check` passed. No full suite or browser run was needed for these isolated upload-error rendering changes.

## Limitations

- No live backend or browser session-recovery flow was exercised; request responses were stubbed by frontend tests.
- The requested `.agents/skills/implement/SKILL.md` and `.agents/skills/self-documenting-code/SKILL.md` were absent from this worktree. Available Ponytail and superpowers TDD guidance were read and followed.
