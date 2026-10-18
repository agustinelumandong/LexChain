# Issue 125 document journey evidence

Run date: 2026-10-18
Branch: `feature/issue-125-complete-document-journeys`
Base: `origin/dev` at `c93e60a74eaa1d129a7feae1e8f6af8b6c9986f1`

This report separates browser checks that intercept backend-shaped responses from runs against the backend. A mocked browser pass verifies frontend behavior only.

## Prerequisites and safety

- Live run requires a designated disposable backend, dedicated lawyer and participant accounts, an approved test PDF, and provisioned Google, OCR, and chain integration access.
- Required environment variables for `e2e/full-flow.mjs` are `E2E_BACKEND_URL`, `E2E_DISPOSABLE_BACKEND_CONFIRM`, `E2E_LAWYER_EMAIL`, `E2E_LAWYER_PASSWORD`, `E2E_PARTICIPANT_EMAIL`, `E2E_PARTICIPANT_PASSWORD`, and `E2E_PDF_PATH`. The runner starts its own local Next.js server and injects the confirmed backend URL as both `API_URL` and `NEXT_PUBLIC_API_URL`; `E2E_BASE_URL` is not required.
- Do not put values of these variables in this report, source, logs, screenshots, or diagnostics.
- Live finalization and other irreversible operations must target disposable records on the designated test backend.

## Outcomes

| Area | Outcome | Evidence |
| --- | --- | --- |
| Focused deterministic browser regressions | PASS (MOCKED) | The following all passed: `e2e:notifications`, `e2e:session-recovery`, `e2e:signed-filing`, `e2e:upload-recovery`, `e2e:google-drafting`, `e2e:google-comments`, `e2e:document-permissions`, `e2e:document-verification`, `e2e:owned-shared-documents`, and `e2e:signed-pdf-finalization`. The signed-filing check exercises permitted signed-copy replacement, including the replacement reason and multipart PUT. Requests were intercepted or consent/provider screens were stubbed; this is frontend evidence only. |
| Integrated prepared journey | PASS (MOCKED) | `pnpm e2e:document-journeys` passed the prepared journey with intercepted backend-shaped responses. It covered draft creation, lawyer guidance, unresolved comment count and validated draft link, comment recovery, readiness, signed-copy attachment, one finalization, OCR edit/approval, Search, Ask, and verification. Reopen and replacement controls were absent because this fixture denies `can_reopen` and `can_replace_signed_copy`; permitted reopen is covered by `e2e:google-comments`, and permitted replacement by `e2e:signed-filing`. |
| Integrated direct filing journey | PASS (MOCKED) | The same command passed direct open/closed-book filing, conflict recovery with a successful signed-copy attachment request, duplicate recovery, finalization, OCR edit/approval, and verification. Replacement was absent because the fixture denies `can_replace_signed_copy`. |
| Live runner target isolation | PASS (STATIC) | `e2e/full-flow.mjs` now starts its own local Next.js server with `API_URL` and `NEXT_PUBLIC_API_URL` set to the exact `E2E_BACKEND_URL` that matches `E2E_DISPOSABLE_BACKEND_CONFIRM`. It was syntax-checked only; no live runner was started. |
| Live backend journeys | BLOCKED | No configured accounts, PDF, or backend URL were present; local `http://localhost:8000/health` and `/openapi.json` timed out. No authenticated or mutating request was made. |
| Google consent/Picker | BLOCKED | Live integration access and consent are not provisioned in this environment. Mocked Google handoff is not live evidence. |
| Blockchain outcome | BLOCKED | Live disposable backend and integration access are unavailable. Mock verification/finalization is not chain evidence. |
| OCR outcome | BLOCKED | Live disposable backend and test PDF are unavailable. Mock processing/review is not OCR evidence. |
| Human-assisted consent | UNPERFORMED | No human-assisted run was performed. |
| Application tests | PASS | `pnpm exec vitest run --testTimeout=15000`: 94 files and 804 tests passed. The default 5-second run timed out in two slow tests; a 10-second run timed out in one. |
| Script tests | PASS | `pnpm test:scripts`: 12 passed. |
| Typecheck | PASS | `pnpm typecheck` exited successfully. |
| Lint | PASS | `pnpm lint` exited successfully with no warnings. |
| Production build | PASS | `pnpm build` exited successfully. |

## Exact next prerequisite

Provision and identify a disposable backend, create dedicated lawyer and participant test accounts, supply an approved test PDF, and configure `E2E_BACKEND_URL`, `E2E_DISPOSABLE_BACKEND_CONFIRM` (exactly equal to the backend URL), `E2E_LAWYER_EMAIL`, `E2E_LAWYER_PASSWORD`, `E2E_PARTICIPANT_EMAIL`, `E2E_PARTICIPANT_PASSWORD`, and `E2E_PDF_PATH`, plus the required Google, OCR, and chain test integrations. Confirm the backend health and OpenAPI endpoints before running any mutating journey. Then update this report with each outcome separately and retain only redacted diagnostics.

## Failures and diagnostic artifacts

No live journey or mutating backend operation was attempted. The legacy live smoke covers upload, invitation, participant visibility, and verification only; it is not a complete live prepared/direct journey and cannot report Google consent, OCR, or chain outcomes. Complete live coverage therefore remains blocked even after the smoke's prerequisites are provisioned. Add sanitized error summaries and non-sensitive artifact paths here if a future deterministic browser check fails; never attach credentials, auth cookies, tokens, or private PDFs.
