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

`UploadRequestError` parsing in `src/features/documents/portal-upload.ts` discards malformed `details.errors` entries that have no readable `message`/`msg`/`detail`. The page can show readable unassociated entries and unknown-field entries, as tested, but cannot display entries that the existing parser removes. That parser file is omitted from Task 5's file plan. Proposed minimal follow-up: adjust that parser to preserve a safe readable fallback for malformed entries and add focused parser/page coverage. I did not broaden this task into that file.

## Limitations

- No live backend or browser session-recovery flow was exercised; request responses were stubbed by frontend tests.
- The requested `.agents/skills/implement/SKILL.md` and `.agents/skills/self-documenting-code/SKILL.md` were absent from this worktree. Available Ponytail and superpowers TDD guidance were read and followed.
