# LexChain manual testing guide

_Prepared 2026-10-21 from the current frontend flows and backend source reviewed at `05f99cfdd5047bd8214fb328fb963b09704e80a2`._

Use this guide to try each available feature, check the result, and record what fails or cannot be tested. It is a test plan, not a record of passing tests. No runtime results have been filled in, and following it does not require changing application code.

Start with the already-signed PDF journey. Then try the Google draft journey, sharing, administration, and production PWA checks. A prepared record can attach its signed PDF after the lawyer selects a register book; closed books also require the paper document and page numbers.

## 1. Prepare your test environment

### Choose live testing or a mock walkthrough

| Mode | What it is useful for | What it cannot prove |
|---|---|---|
| Live backend, both mock flags `false` | Real accounts, storage, permissions, document processing, Google integration, blockchain responses | Success still needs to be observed for each case |
| Mock mode, both flags `true` | Learning the navigation and trying fixture-based screens | Real persistence, OCR, Google consent, indexing, chain transactions, or production permissions |

Keep results from the two modes separate. Mock mode uses synthetic document and signed-copy data, local PDF fixtures, and simulated verification results. It does not prove live storage, PDF hashing, OCR, Google access, authorization, or blockchain behavior.

### Gather accounts and files

Ask the backend owner for a disposable test environment and these accounts:

- **Lawyer A:** creates books/documents and owns the main test record.
- **Participant B:** receives and responds to document invitations.
- **Unrelated user C:** checks that private documents remain inaccessible.
- **Second lawyer or administrator:** tests lawyer invitations and user activation, where backend permissions allow it. A lawyer recipient also helps test the party role options restricted to lawyers.

Use separate browser profiles or separate browsers for A, B, and C. Tabs in the same browser profile share session cookies, so they do not reliably represent different users.

Prepare a small test PDF whose contents you know, a corrected version, an empty file, and a non-PDF file. You can use [the scanned test PDF](scanned-docx-for-testing/sample_scanned_deed_of_sale_app_test.pdf) and [the alternate sample](scanned-docx-for-testing/sample_scanned_deed_of_sale_app_test_alternate.pdf). Use fictional names and values. A local filename containing “tampered” is not evidence of a live tamper result.

Give records a recognizable prefix, such as `QA 2026-10-21 Deed A`. Write down the IDs returned by the backend. Use a fresh record for each destructive or incompatible lifecycle test.

Finalization and extraction approval freeze data. Closing a book is one-way; there is no documented reopen operation. This contract has no document deletion endpoint, so agree with the backend owner how test records and any chain records will be retained or cleaned up. Do not use real legal documents for these exercises.

### Start the frontend locally

If you are testing an existing deployed frontend, have its owner confirm the backend URL and mock flags, then skip these commands.

From PowerShell in the repository root:

```powershell
node --version
pnpm --version
pnpm install --frozen-lockfile
```

Use Node 24.12.0 or newer and pnpm 11.13.0. If `.env.local` does not already exist, create it without overwriting an existing file:

```powershell
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
}
```

Set these values in `.env.local`, using the backend address confirmed for this test run:

```dotenv
API_URL=https://YOUR-CURRENT-TEST-BACKEND
NEXT_PUBLIC_API_URL=https://YOUR-CURRENT-TEST-BACKEND
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_API=false
USE_MOCK_API=false
```

Use the backend base address without `/docs` or `/openapi.json`. Start FastAPI and any tunnel separately if you maintain them. Confirm the backend URL with its owner; do not copy an old test URL from a prior run.

```powershell
pnpm dev
```

Open `http://localhost:3000`. Restart the frontend after environment changes. Rebuild production output after changing public environment values. This frontend repository does not start the separate FastAPI backend.

For template/existing Google Docs selection, also configure `NEXT_PUBLIC_GOOGLE_PICKER_API_KEY` and `NEXT_PUBLIC_GOOGLE_PICKER_APP_ID` for the Google Cloud project and allowed frontend origin. Blank drafts do not require Picker settings. The backend owner must configure Google OAuth and the return URL for this frontend; frontend settings alone cannot do that. See [the README](../README.md) for setup.

## 2. Record results as you go

Use one of these statuses for each case and each operation in the appendix:

| Status | Use it when |
|---|---|
| NOT RUN | You have not attempted the case |
| PASS | You observed the expected UI and backend outcome |
| FAIL | You attempted it and observed an incorrect result |
| BLOCKED | A prerequisite, configuration, known UI limitation, or dependency prevents the test |
| SKIPPED | You deliberately did not attempt it; record why |
| MOCK ONLY | You observed fixture behavior without the real backend |

Open browser Developer Tools → Network before each journey. Enable Preserve log, filter Fetch/XHR, and watch the request while using the screen. Browser requests normally go to Next.js `/api/...` handlers. For generic proxies, the backend target appears in the `path` query parameter. Backend credentials are held on the server; the absence of a browser Bearer header on a same-origin request is expected.

For important mutations, inspect the response, reload the page, and confirm the saved state. A toast, an empty table, or an HTTP 200 alone does not establish the complete user outcome. Some user/invitation loaders currently turn backend failures into empty lists.

Copy this template for each failed or blocked case:

```markdown
### Test result

- Case ID:
- Mode and frontend/backend addresses:
- Date/time and frontend commit:
- Account role (no password or token):
- Test document/book ID:
- Status: NOT RUN / PASS / FAIL / BLOCKED / SKIPPED / MOCK ONLY
- Steps attempted:
- Expected result:
- Actual result:
- Frontend request and backend method/path:
- HTTP status and redacted error:
- Screenshot/log reference:
- What happened after reload:
```

Keep screenshots and notes free of passwords, cookies, tokens, private PDF contents, and invitation links that grant access. Raw HAR files can contain secrets; inspect and redact them before sharing.

## 3. Account and session checks — T01

1. Open `/register` in a signed-out browser. Enter first name, last name, an accessible test email, a password, and its confirmation.
2. Try a malformed email, mismatched confirmation, and a password missing the stated requirements. Expect clear validation and no account-created message.
3. Submit valid values once. Expect the returned account-created result. If email confirmation is required, follow the actual email link before signing in; record BLOCKED if no test inbox or mail delivery is available.
4. Open `/auth/verified`, enter the test account email, and use Resend verification once. The signup success screen links to login; open this route explicitly to test resend. Expect neutral feedback. A successful resend response does not prove that an email arrived. Avoid repeated requests; signup/signin and resend have rate limits.
5. Open `/login`. Try one incorrect password, then the correct credentials. Expect failure without a session for the first attempt and the correct role-specific portal for the second.
6. Confirm Lawyer A lands on `/portal/dashboard`, Participant B on `/portal/documents`, and the account/profile page matches the signed-in account. Record any backend role mismatch rather than assuming ordinary signup creates a lawyer.
7. Sign out using the portal or profile action. Reload a protected route. Expect a sign-in redirect or denied access with no private content shown.
8. Sign in again for the next cases. Local cookie cleanup can succeed even if backend signout fails; record upstream revocation as unverified unless the backend owner checks it separately.

**Endpoints:** signup, signin, signout, resend verification, and `GET /users/`. Expected failures include invalid credentials, unverified email, or an inactive account. Use the displayed/backend explanation to distinguish them from a network outage.

## 4. Create and inspect register books — T02

As Lawyer A, open `/portal/books`.

1. Create an **OPEN** book with a valid book number and test series year. Expect it in the list after reload.
2. Open Details. Compare status, entry count, last document number, last page number, and closed date with the response.
3. Try creating a second OPEN book in the same year while the first is open. The contract allows at most one OPEN book per year; expect rejection without silently replacing the first.
4. Create a separate **CLOSED** book for paper-register migration. Keep it for T04; do not use Close on your active book yet.
5. Create another empty book for T13's deletion check, using a supported year/status combination that does not conflict with the one-open-book rule.

**Endpoints:** `GET /books/`, `POST /books/`, `GET /books/{book_id}`. The current shared list helper retrieves only the first 50 books. A book outside that page may be unavailable in selectors; record the limitation if your data exceeds it.

## 5. Upload an already-signed PDF — T03

Use the OPEN book from T02. This is Path 2 and is the easiest main journey to test first.

1. Open `/portal/upload`. Enter the test title, choose the OPEN book, and select your PDF.
2. Before a valid submission, try leaving the title/book blank and selecting a non-PDF file. Expect validation or backend rejection with no successful document record. Also try an empty PDF file; record whether the browser or backend rejects it.
3. Submit the valid PDF once. Expect a new record ID and a **SIGNED** document workspace. Under this contract, upload alone does not queue OCR or anchor the PDF.
4. Reload the workspace and library. Confirm title, lifecycle, assigned book, and current signed PDF remain available. Open the PDF and compare it with the uploaded fixture.
5. Rename the document before finalization and reload. Expect the new title to persist.
6. Open History, Access, and Signed copies. Confirm real responses are distinct from empty/error states. History lists lifecycle actions; signed-copy history lists legal PDF copies.
7. Try uploading the same PDF again as a separate test. Expect the backend's duplicate-file/book conflict behavior; record the actual error. If a READY_FOR_SIGNATURE record triggers `READY_FOR_SIGNATURE_EXISTS`, use Confirm as new record only when you intentionally want a different record. That confirmation does not attach to the existing draft.

**Endpoints:** document list/create-upload/detail/rename/history/signed-copies and `GET /documents/{document_id}/file`. Record the ID as **Document A**. Keep it unfinalized for T05 and sharing tests.

## 6. File into a closed book — T04

Use a different PDF/new record and the CLOSED book from T02.

1. Choose the CLOSED book on `/portal/upload`.
2. Try submitting without the paper register Doc. No. and Page No. Expect validation.
3. Enter positive whole numbers from your fictional paper register and submit. Expect a SIGNED record with those values after reload.
4. Try a duplicate document number in that book on another disposable record. Expect rejection according to the returned conflict, without changing the first entry.

A closed book still accepts filing with explicit paper numbers. “Closed” does not mean that the UI should hide it from upload selection.

## 7. Correct and replace before finalization — T05

Use Document A while it is SIGNED and owned by Lawyer A.

1. On Overview, use Correct register entry if permitted. Select the intended book and valid Doc. No./Page No.; save and reload. Expect the returned details to persist.
2. Try zero, negative, or fractional register numbers. Expect validation and no saved invalid entry.
3. On Files, choose Replace signed PDF. Select the corrected fixture and enter a meaningful test reason.
4. Try submitting without a reason. Expect the operation to be prevented/rejected.
5. Submit with a reason. Expect the current PDF to change; the prior signed copy should remain in Signed copies with its replacement history.
6. Reload and confirm the current file and history. Open the current PDF in the workspace and confirm a previous copy can be opened from its history. Do not finalize until this check is complete.

**Endpoints:** `PATCH /documents/{document_id}/entry`, `PUT /documents/{document_id}/signed-copy`, `GET /documents/{document_id}/signed-copies`, `GET /documents/{document_id}/file`.

## 8. Invite, accept, decline, and revoke access — T06

Keep Lawyer A and Participant B in separate browser profiles.

1. As A, open `/portal/documents/{id}/participants` for Document A. Find B by email and invite B as a viewer. Expect a pending invitation. Test an unknown test address as a separate lookup; expect a not-found result rather than a fabricated account.
2. As B, reload Shared Documents before accepting. A pending invitation should not grant document access.
3. As B, open `/portal/invitations` and accept. Expect access to the shared document after reload. Confirm B sees the correct document and only permitted actions.
4. On a separate record/invitation, choose Decline. Expect no document access. Have A invite B again; the contract permits reopening the invitation after refusal.
5. As A, inspect the party list and revoke B's access to Document A. As B, reload and try the direct document URL. Expect access to be denied or the document to disappear from the shared library. A previously opened tab must not establish continuing backend access.
6. Invite B again if you want B to participate in later verification/search checks.
7. With a second lawyer account, try permitted signer/editor invitation choices. Those roles are restricted to lawyers. Record rejected role combinations; do not reinterpret a viewer as a signer.

**Endpoints:** user search, parties GET/POST/DELETE, my invitations GET, invitation accept/decline POST. These tests check real sharing rather than merely whether the buttons appear.

## 9. Finalize and verify the signed PDF — T07

Use Document A after confirming its correct file and register entry.

1. As A, choose Finalize, read the confirmation, and submit once.
2. Expect **FINALIZED**, the returned chain identifiers/hash information, and an OCR job queued according to backend status. Reload to confirm the result is persistent.
3. Open `/portal/documents/{id}/verify`. Expect a server-computed verdict with message and available hash/transaction details. If the stored file is unchanged and services are healthy, the intended result is AUTHENTIC. Record the actual verdict rather than treating every successful request as authentic.
4. Try renaming, replacing the PDF, or correcting the register after finalization through the existing UI. These actions should be unavailable/rejected according to permissions and the contract. Confirm the stored state is unchanged.

| Verification result | How to interpret it |
|---|---|
| AUTHENTIC | Current stored PDF matches the on-chain hash |
| TAMPERED | Current stored PDF does not match the anchor |
| SNAPSHOT_COMPROMISED | The stored original cannot be trusted as a comparison baseline |
| NOT_ANCHORED | No finalization anchor is available |
| VERIFICATION_UNAVAILABLE | Integrity could not be checked; this is not evidence of tampering |

The contract also lists a 404 for missing documents or no on-chain record. Record that response if returned; do not insist that every unanchored record returns a 200 NOT_ANCHORED result.

This verification checks the stored signed copy. It is not an arbitrary local-PDF comparison tool. To test tampered/compromised results live, ask the backend owner to prepare isolated fixtures and explain the expected hashes. Skip that variant if no controlled fixture is available. Never change live storage merely to trigger a verdict. A highlighted tamper preview in mock mode is fixture behavior only.

**Endpoints:** finalize POST and verify GET. A transaction identifier displayed by the UI is response evidence; independent confirmation on the intended chain requires the backend owner/provider's verification.

## 10. Review OCR and approve text — T08

After T07, wait for OCR on Document A. Refresh or use the existing processing view at `/portal/upload/processing?id={document_id}`. If processing never advances, record the status, elapsed wait, and backend error; mark dependent tests BLOCKED rather than repeatedly finalizing. If the document reaches FAILED, only its owner should see Retry processing. Submit once; expect HTTP 202 and the failed phase to be queued again without repeating finalization or anchoring. Reload and record whether processing advances.

1. When extracted text is available, open `/portal/documents/{id}/review` as A.
2. Compare extracted names, dates, amounts, and page layout with the signed PDF. Expect text blocks and any reported flags; bounding boxes depend on the OCR engine and fixture.
3. Select a flagged block and confirm it points to the relevant text/page where layout is supplied.
4. Edit one clearly incorrect OCR block. Save changes and reload. Expect the correction to persist and flags to be recomputed. The contract says raw OCR remains preserved.
5. Try Analyze semantic issues after saving. Expect a returned analysis result or a clear failure; a clean fixture may produce no issues. Do not manufacture a failure just because no flags appear.
6. Make another edit and confirm analysis/approval cannot proceed with unsaved changes. Save it before continuing.
7. Approve extracted text once. Expect the reviewed text to be frozen and indexing/enrichment queued. Reload and confirm approval remains recorded and edit controls are disabled.

Approval freezes reviewed text; it does not anchor that text on-chain. An OCR correction should not be treated as a change to the signed PDF.

**Endpoints:** extraction GET/PATCH, extraction/analyze POST, extraction/approve POST, and `POST /documents/{document_id}/retry-processing`.

## 11. Search and ask questions — T09

Wait for indexing of Document A's approved text. Choose a phrase or fact that actually appears in the fixture.

1. In the document workspace Search tab, search for that phrase. Expect a response scoped to the selected document, with the contract's hit identifiers/scores.
2. Open `/portal/search` and repeat. Expect results only from documents the account may access. Open a result and confirm it leads to the appropriate document.
3. Open `/portal/documents/{id}/ask` and ask a question with an answer you can check in the PDF, such as “What amount is stated in this agreement?” Compare the answer with the fixture. AI output is assistance, not proof of legal correctness.
4. Try an irrelevant query/question and observe empty results or the actual answer. Expect a usable UI without fabricated certainty or crashes.
5. As B, repeat only where shared-document permissions allow it. As unrelated C, search for the same private phrase; expect no unauthorized private content. The exact filtering behavior must be checked against the live backend.

**Endpoints:** per-document search POST, global search POST, document ask POST. Swagger's ask 200 schema is unspecified; capture the actual response shape and whether the UI renders it correctly.

## 12. Prepare a Google draft and sign it — T10

Use a new record, **Document D**, so this journey stays separate from the already-signed upload path.

1. As A, open `/portal/profile/account`. Inspect the Google connection card. Choose Connect, then Continue to Google, follow the consent flow, and return to the configured frontend.
2. Expect a connected result confirmed by a fresh connection-status request. Record cancelled consent and an invalid return/configuration as separate outcomes. The callback is called by Google, not by clicking Execute on `/google/callback` in Swagger.
3. Open Documents → Create document draft. Enter a name. Expect a PREPARING record with no signed PDF or register entry.
4. Optionally invite B and have B accept as in T06. On Files, create a blank Google Doc. Expect a valid Google Docs link; open it in Google and write fictional test text.
5. On separate fresh records, test template and existing-Doc options using Google Picker if configured. Draft creation is once per record; do not create all three options on Document D.
6. Add a Google comment. Return to LexChain's Comments tab and use Sync comments. Expect the comment thread to appear. Accepted clients are documented as commenters, with accepted lawyer parties receiving editor access; check the actual Google sharing if available.
7. With an unresolved thread, try Mark ready for signature. Expect the documented `UNRESOLVED_COMMENTS` rejection. Resolve the thread in Google, sync/retry, and expect READY_FOR_SIGNATURE with the draft locked for clients.
8. Choose Reopen draft. Expect PREPARING and commenting on the same existing Doc, not another draft creation. Mark ready again when the text is agreed.
9. Complete the signing step outside LexChain using only a test document; select a test signed PDF for attachment.
10. Open Files → Attach signed PDF. Choose a register book. For a CLOSED book, enter the paper Doc. No. and Page No.; for an OPEN book, allow automatic allocation or choose to enter the paper numbers.
11. Submit and confirm that the signed copy is attached to Document D's original ID. Continue T05, T07, T08, and T09 on D. A successful `/documents/upload` creates a different record and does not pass this prepared-record path.

**Endpoints:** Google connection/connect/callback/Picker token; document open/draft/comments/sync/ready/reopen/signed-copy. A working OAuth flow alone does not establish that the whole draft-to-finalization path passes.

## 13. Cancel an unsigned record and disconnect Google — T11

1. Create a separate PREPARING record and use Cancel document. Confirm cancellation, reload, and expect CANCELLED with the record retained.
2. Repeat on a separate READY_FOR_SIGNATURE record if T10 reached that state. Expect cancellation to be allowed only in supported unsigned states.
3. On the account Google card, cancel the Disconnect confirmation once; expect the connection to remain.
4. Confirm Disconnect after the other draft tests. Expect LexChain's Google connection to be revoked. Existing drafts remain in the lawyer's Drive; disconnect should not be described as deleting them.

**Endpoints:** cancel POST and Google connection DELETE.

## 14. Notifications — T12

Use an event from the invitation/document tests that the backend actually reports as a notification.

1. Inspect the portal bell and `/portal/notifications`. Confirm list rows and unread count load for the signed-in account.
2. Mark one unread notification read. Expect that row to update; reload and compare the bell count with the unread-count response.
3. Mark all read. Expect the backend unread count to update and the list/bell to reflect it after refresh.
4. Switch accounts. Expect each account's own notifications rather than another user's inbox.

**Endpoints:** notification list/unread-count GET and single-read/read-all PATCH. The current list uses the backend's default page, so its visible row count may differ from total unread count when there are more notifications. Do not call an inaccessible endpoint “no notifications.” If there is no notification fixture, mark these cases BLOCKED until one is prepared.

## 15. Close and delete books — T13

Do these checks after filing tests are complete.

1. Close the populated OPEN test book. Confirm, reload, and expect CLOSED. There is no documented reopen action.
2. If needed, create the next OPEN book for the same year after closure; expect the one-open-book restriction to permit it.
3. Try deleting a populated book through an available action. Expect the action to be hidden/blocked or the backend to refuse it; finalized documents must not disappear.
4. Delete the separate empty book prepared in T02. Expect it to disappear after reload. The backend success is bodyless 204; the UI should not treat that empty response as an error.

**Endpoints:** book close POST and book delete DELETE.

## 16. Users and issuer invitations — T14

Use the test role authorized by the backend for these operations. Lawyer navigation alone does not prove access to every admin endpoint.

1. Open `/portal/dashboard` and verify the backend metrics response and visible values. Distinguish a failed metric request from zero activity.
2. Open `/portal/users`. Confirm known test accounts match the response. An empty screen is insufficient evidence if the loader failed.
3. Suspend a spare test account, not the account running this case. Expect the returned active state to change and that account's next protected request/sign-in to be denied.
4. Reactivate the spare account and confirm it can sign in again.
5. The contract forbids deactivating yourself or the last active lawyer. If the UI hides those actions, record the guard; direct rejection testing belongs in the authorized Swagger checks in section 20. Do not lock out your test administrator.
6. Open `/portal/issuer-invitations`, create a lawyer invitation for a controlled test address, and confirm it persists in the list.
7. For an invited lawyer test, use a controlled address and verify the actual email/link first. The web signup sends email/password/name fields without the token; backend source currently assigns and claims a pending, unexpired lawyer invitation when a new account signs up with the same email. Check the resulting account role and invitation status from the authorized backend/admin view. Existing accounts behave differently: a different role is changed when the invitation is created, while a same-role account can leave the invitation pending. Do not use a real user account for this check.
8. Revoke a spare unused invitation and reload. Expect it removed/revoked according to the response. Keep any invitation needed for onboarding tests separate.

**Endpoints:** admin dashboard/users/invitations GET, users active PATCH, invitations POST/DELETE. The current creation UI chooses lawyer invitations; the contract also permits a user role, which is not exposed by that UI.

## 17. Check access, errors, and usability — T15

1. As C, open a known private document URL and try its review/verify/participants routes. Expect no private data and no successful unauthorized mutation. Use only the test IDs you were given.
2. As B, check that owner-only rename, finalize, entry correction, and access-management actions are unavailable or rejected. Visible buttons are not authorization evidence; backend responses decide access.
3. Sign out and reload protected pages. Use Back after logout and confirm protected data cannot be fetched with the ended local session. Cache behavior and backend revocation need separate observation.
4. In a controlled local test, interrupt connectivity for a read and then a mutation. Expect a clear error and no false success. On retry, confirm the actual saved state first to avoid duplicate records. Check whether selected files and edits are retained.
5. Use keyboard Tab/Enter/Escape on forms and confirmation dialogs. Expect accessible labels, visible focus, and usable actions. Test a narrow/mobile viewport and confirm the PDF/forms remain usable.

Record missing/error/denied states separately. A failed request is not an empty library, and a failed verification is not proof of tampering.

## 18. Explore pages with limited backend support — T16

| Screen/feature | What to try | Expected current limitation |
|---|---|---|
| Categories | Add/edit a test category, then refresh | Local UI state; this is not backend category persistence |
| Reports | Generate/download a report and inspect its labels | Seeded local demo data, not a live office report |
| Office settings | Save a test value, then reload | Demo/session state; not authoritative backend configuration |
| My E-copy Requests / Document Requests | Open as the relevant role | Unavailable state; submission/review is not a connected workflow |
| Document activity / admin audit logs | Open the current screen and capture its response if available | Backend targets are absent from the reviewed Swagger schema; support requires confirmation |
| Legacy blockchain record handler | Do not treat it as a second anchoring action | `/blockchain/record/{id}` is outside Swagger; the documented anchor is document finalization |
| Users → Edit | Change only a spare test account's displayed details and reload | Demo-local updates; they do not persist through the backend |
| Users → Reset password / Change role | Inspect the menu action | Currently closes the menu without a corresponding backend operation; do not count this as a completed account change |

Mark local features **MOCK ONLY/local UI** rather than backend PASS. An unavailable screen behaving honestly can pass its UI expectation while the corresponding product capability remains unavailable.

## 19. Production PWA and repository checks — T17

PWA behavior must be tested against a production build, not `pnpm dev`. Stop the development server before using the same port:

```powershell
pnpm test
pnpm test:scripts
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

Record each check independently. Passing these commands does not establish live backend success. Do not automatically change code when a check fails; capture its output for the later fix phase.

In another terminal, the existing PWA smoke check is:

```powershell
pnpm exec playwright install chromium
$env:E2E_BASE_URL = 'http://localhost:3000'
node e2e/pwa.mjs
```

This script explicitly registers the worker during its checks. A passing script does not prove that the app registered it automatically; verify automatic registration in manual step 1 before relying on the script result.

For a manual check:

1. Open the production app over localhost or deployed HTTPS in a supported browser. Inspect Application → Manifest and Service Workers. Expect valid app metadata and registration.
2. Install the app if the browser/device offers it; open it and check the same portal routes.
3. Inspect Cache Storage. The worker's cache should contain only the static offline fallback, not PDFs, API responses, authenticated pages, or tokens.
4. Turn off connectivity and attempt an eligible navigation. Expect the reconnect fallback. Document work requires connectivity; there is no offline mutation queue or background sync.
5. Reconnect and verify normal requests resume. Record browser/OS/device; desktop success does not pass physical Android/iOS installation.

The existing `e2e/full-flow.mjs` is not a substitute for this guide: it mutates backend data and still expects a native `<select>` for books, while the current UI uses a shared dropdown. Leave it SKIPPED unless its current compatibility and test-account setup are reviewed. Do not change it during this documentation/testing-only phase.

## 20. Use Swagger to isolate a failure — T18

Start with the frontend tests. Use Swagger only when you need to determine whether a failed UI action also fails at the backend, or when an authorized contract case has no UI option.

1. Open your confirmed test backend's `/docs` and expand the relevant method/path. Read its request fields, required parameters, response statuses, and prerequisites.
2. For protected operations, obtain an access token through the documented test signin flow and enter it privately using Authorize, following that UI's expected format. Never save the token in this guide, screenshots, Git, or chat.
3. Use only your disposable test IDs. First inspect a GET where possible. For mutations, check whether the previous frontend attempt already succeeded before clicking Execute.
4. Supply the exact JSON/query/multipart fields shown by Swagger. Attaching a PDF needs `book_id`; replacing it needs a reason. Calling Google callback manually cannot reproduce provider consent.
5. Record the backend status and redacted body next to the frontend result. A direct Swagger success means **backend operation passed directly**; it does not turn a blocked frontend workflow into a frontend PASS.
6. Clear authorization after testing. Treat any copied token or invitation link as private.

Use this split when diagnosing: UI action → same-origin Next receiver → backend response → saved outcome. If `/docs` or `/openapi.json` returns an error or HTML instead of the intended service, mark backend-dependent tests BLOCKED. Do not regenerate the checked-in contract merely to run these manual tests.

## 21. Finish the test run

Record totals separately for live PASS, FAIL, BLOCKED, SKIPPED, and MOCK ONLY. List the IDs created and any approved/finalized/closed records that remain. Reactivate spare accounts, revoke unused test invitations, and disconnect test Google access when appropriate. Ask the backend owner to handle any agreed cleanup that has no supported frontend operation.

Do not report “everything works” if a required case or dependent operation remains blocked. A useful handoff says which journey passed, which step stopped, the actual response, and what prerequisite or later fix is needed.

Related references: [user-flow guide](USER-FLOW-ARCHITECTURE.md), [use-case diagram](lexchain-usecase-flow.md), [architecture](ARCHITECTURE.md), and [checked-in OpenAPI](../openapi-updated.json). The older integration audit is a historical snapshot; use the current source and this run's observations for results.

## Appendix: operation-by-operation checklist

Every row starts NOT RUN. Update it only after testing that method/path. If an earlier step blocks a journey, mark its downstream operations BLOCKED with the dependency. The Google callback row requires a real OAuth redirect, not a frontend fetch.

| Operation | Case | Status | Evidence / reason |
|---|---|---|---|
| `POST /auth/signup` | T01 | NOT RUN | |
| `POST /auth/signin` | T01 | NOT RUN | |
| `POST /auth/signout` | T01 | NOT RUN | |
| `POST /auth/resend-verification` | T01 | NOT RUN | |
| `GET /users/search` | T06 | NOT RUN | |
| `GET /users/` | T01 | NOT RUN | |
| `GET /documents/` | T03 | NOT RUN | |
| `POST /documents/` | T10 | NOT RUN | |
| `POST /documents/upload` | T03, T04 | NOT RUN | |
| `GET /documents/{document_id}` | T03 | NOT RUN | |
| `PATCH /documents/{document_id}` | T03 | NOT RUN | |
| `POST /documents/{document_id}/draft` | T10 | NOT RUN | |
| `GET /documents/{document_id}/comments` | T10 | NOT RUN | |
| `POST /documents/{document_id}/comments/sync` | T10 | NOT RUN | |
| `POST /documents/{document_id}/ready` | T10 | NOT RUN | |
| `POST /documents/{document_id}/reopen` | T10 | NOT RUN | |
| `POST /documents/{document_id}/cancel` | T11 | NOT RUN | |
| `POST /documents/{document_id}/signed-copy` | T10 | NOT RUN | |
| `PUT /documents/{document_id}/signed-copy` | T05 | NOT RUN | |
| `GET /documents/{document_id}/signed-copies` | T05 | NOT RUN | |
| `GET /documents/{document_id}/file` | T03, T05, T07 | NOT RUN | |
| `PATCH /documents/{document_id}/entry` | T05 | NOT RUN | |
| `GET /documents/{document_id}/history` | T03 | NOT RUN | |
| `GET /documents/invitations/mine` | T06 | NOT RUN | |
| `POST /documents/invitations/{invitation_id}/accept` | T06 | NOT RUN | |
| `POST /documents/invitations/{invitation_id}/decline` | T06 | NOT RUN | |
| `GET /documents/{document_id}/parties` | T06 | NOT RUN | |
| `POST /documents/{document_id}/parties` | T06 | NOT RUN | |
| `DELETE /documents/{document_id}/parties/{party_user_id}` | T06 | NOT RUN | |
| `POST /documents/{document_id}/finalize` | T07 | NOT RUN | |
| `GET /documents/{document_id}/verify` | T07 | NOT RUN | |
| `GET /documents/{document_id}/extraction` | T08 | NOT RUN | |
| `PATCH /documents/{document_id}/extraction` | T08 | NOT RUN | |
| `POST /documents/{document_id}/extraction/analyze` | T08 | NOT RUN | |
| `POST /documents/{document_id}/extraction/approve` | T08 | NOT RUN | |
| `POST /documents/{document_id}/retry-processing` | T08 | NOT RUN | |
| `POST /documents/{document_id}/search` | T09 | NOT RUN | |
| `POST /documents/{document_id}/ask` | T09 | NOT RUN | |
| `POST /search` | T09 | NOT RUN | |
| `GET /admin/dashboard` | T14 | NOT RUN | |
| `GET /admin/users` | T14 | NOT RUN | |
| `GET /admin/invitations` | T14 | NOT RUN | |
| `POST /admin/invitations` | T14 | NOT RUN | |
| `DELETE /admin/invitations/{invitation_id}` | T14 | NOT RUN | |
| `PATCH /admin/users/{user_id}/active` | T14 | NOT RUN | |
| `GET /notifications/` | T12 | NOT RUN | |
| `GET /notifications/unread-count` | T12 | NOT RUN | |
| `PATCH /notifications/{notification_id}/read` | T12 | NOT RUN | |
| `PATCH /notifications/read-all` | T12 | NOT RUN | |
| `GET /books/` | T02 | NOT RUN | |
| `POST /books/` | T02 | NOT RUN | |
| `GET /books/{book_id}` | T02 | NOT RUN | |
| `DELETE /books/{book_id}` | T13 | NOT RUN | |
| `POST /books/{book_id}/close` | T13 | NOT RUN | |
| `POST /google/connect` | T10 | NOT RUN | |
| `GET /google/callback` | T10 | NOT RUN | |
| `GET /google/connection` | T10 | NOT RUN | |
| `DELETE /google/connection` | T11 | NOT RUN | |
| `GET /google/picker-token` | T10 | NOT RUN | |
