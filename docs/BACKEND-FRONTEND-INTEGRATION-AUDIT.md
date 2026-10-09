# LexChain backend-to-frontend integration guide

## Current review: updated live API contract, 2026-10-08

**Verdict: partially connected, not fully aligned.** This section supersedes the local-backend conclusions below for frontend integration planning. Evidence is the current `openapi-updated.json` supplied after connecting to the live service, compared with current frontend source. No authenticated live requests or backend mutations were performed. OpenAPI presence confirms a documented contract, not successful deployed execution.

The snapshot contains **57 method/path operations**, compared with 40 in Git HEAD: **20 additions and three removals**. The separate ignored backend checkout is historical reference only. In particular, the updated contract does include `GET /users/`, documents, notifications, admin and Google operations. The earlier nine-route count must not be used to describe this service.

### Highest priority gaps and screen effects

| Priority | Evidence and gap | User-visible consequence and implementation direction |
| --- | --- | --- |
| 1 | `package.json:12` generates into `src/lib/types/generated/schema.ts`; `src/shared/types/index.ts:1` imports `src/shared/types/generated/schema.ts`. The two generated files differ. | Refreshing JSON or generating the old destination does not update consumed types. Correct the generator destination, regenerate the consumed schema, and adapt callers together. Preserve the user's untracked output until reconciled. |
| 1 | Books cards use `is_full`, `document_count`, `page_count` (`src/features/office/pages/books-page.tsx:186`); live BookResponse has `status`, `entry_count`, `last_doc_no`, `last_page_no`, `closed_at`. | CLOSED books currently appear Active; counts can be blank. Keep the cards but show OPEN/CLOSED, Entries, Last Doc. No., Last Page No., and closed date. Do not invent total pages from the last page number. |
| 1 | New document contract uses PREPARING → READY_FOR_SIGNATURE → SIGNED → FINALIZED, plus CANCELLED. Old workspace/version/finalization logic remains. | Signed uploads must lead to the signed-document workspace, not a promise of background processing. Use server-returned lifecycle and permissions for controls; processing status is separate and can be null before finalization. |
| 1 | Detail PDF moved to `signed_copy.storage_url`; old detail consumers expect top-level `storage_url`. | A successful detail request may still show no PDF. Render the current signed copy; show a draft link and an appropriate empty state before a PDF exists. |
| 1 | Both logout handlers only clear cookies (`src/app/api/portal/logout/route.ts:3`, `src/app/api/admin/logout/route.ts:3`). | Add server-side `POST /auth/signout` revocation with the existing bearer token and always clear local cookies. The live path is **signout**, not the previous reference's logout. |
| 2 | Generic mutation adapter supports POST/PATCH/DELETE only (`src/app/api/portal/proxy-post/route.ts:5`). | Signed-copy replacement requires PUT; support that method at the existing transport boundary when implementing replacement, preserving multipart and error status. |
| 2 | `UsersManagementView` calls `updateDemoUser` on save (`src/features/admin/users/users-management-view.tsx:335`). | Suspend/reactivate currently changes only the displayed row. Connect `PATCH /admin/users/{user_id}/active`; show pending/error states and the returned account. Backend rejects self-deactivation and deactivation of the last active lawyer. |
| 2 | New Google connection and draft/comment operations have no frontend integration. | Add a lawyer settings connection card and document draft controls within existing screens. Google owns the editor; LexChain displays draft links, synced discussion and lifecycle actions. |
| 2 | Requests, audit-log, blockchain-record, snapshot/restore calls have no corresponding paths in this snapshot. | Do not present these controls as supported live features or silently translate them to unrelated endpoints. Disable unsupported actions with clear explanations until their contracts are confirmed. |

### Existing connections that should be preserved

Additional document findings:

- `src/features/documents/pages/documents-id-page.tsx:28` calls `status.toLowerCase()`; the live detail can legitimately return null status before finalization. Make status handling null-safe before connecting new lifecycle states.
- `src/features/documents/document-lifecycle-ui.ts:19` requires COMPLETED plus draft to finalize. The new service finalizes SIGNED and then queues OCR; use `permissions.can_finalize`, not the old processing gate.
- Account-level lawyer visibility is insufficient for owner-only actions. Detail and participants screens must use returned document permissions (`documents-id-page.tsx:113`, `documents-id-participants-page.tsx:24`) while leaving authorization to the backend.
- Upload processing polling (`src/features/documents/pages/upload-processing-page.tsx:38`) can continue indefinitely on the new pre-finalization null status. Route signed-upload success to detail and explain the next finalization step.
- Verification already handles the five verdicts, but the new schema does not declare `tamper_report`/changed blocks/page count. Do not promise a section diff from hash metadata (`src/features/verification/components/verify-workspace.tsx:51`).
- Global search hit schema declares chunk/document IDs, index and score, not snippet `text`; the current search screen expects `text` (`src/features/documents/pages/search-page.tsx:106`). Show supported identifiers or resolve documented content rather than treating a blank snippet as no result. Ask returns an unspecified JSON schema, so its exact answer format cannot be verified from this contract alone.
- The document-specific search and user-search operations have no established non-test frontend callers. Document invitations are for the authenticated recipient; the current invitation screen's participant-only gate should be reconciled with permissions for lawyer recipients.

- Sign-in already sends JSON email/password and consumes role to establish server-held cookies. Portal layout and Books already use the role provider; the earlier missing-profile gate is no longer present (`src/app/portal/layout.tsx:7`, `src/features/portal/portal-layout.tsx:25`, `src/features/office/pages/books-page.tsx:53`). Role hints govern presentation; backend authorization remains authoritative.
- Ordinary signup now sends exactly email/password/f_name/l_name and blocks unsupported invitation-token registration. Resend uses email and neutral feedback. Signup still converts upstream 201 to same-origin 200 (`src/app/api/portal/signup/route.ts:63`); preserve upstream success status during adapter maintenance.
- Profile, document reads, rename, extraction, search, parties/invitations, dashboard/user/invitation reads and notification operations have existing callers. Matching a path alone does not establish response or business-flow alignment.
- Notification list, unread count, individual read and read-all use documented methods. The inbox invalidates only its own query after read actions (`src/features/portal/pages/notifications-page.tsx:59`); also invalidate shell list/count so the badge updates immediately. Distinguish fetch errors from an empty inbox; shell currently substitutes empty/zero for errors (`src/features/portal/portal-layout.tsx:30`).
- Admin dashboard/user/invitation schemas match documented core response fields (`src/features/admin/schemas/admin.ts`). Profile security reads an undocumented `mfa_enabled`; absence is not proof MFA is disabled (`src/features/account/pages/profile-security-page.tsx:33`).

### Required document and book journey

1. **Prepare a document:** `POST /documents/` with a display name opens the record. For a working draft, connect Google and create a blank/template/existing draft. Show its `draft_url` as an external editing link, not the legal PDF.
2. **Review discussion:** list/sync draft comments. Show unresolved count, quoted text, replies and sync time. Ready can be refused while comments remain unresolved; surface the backend reason without losing work.
3. **Ready for signature:** call ready; offer reopen only when the returned permissions permit it. Signing is a real-world step; do not portray Google editing as a signed legal document.
4. **Attach signed PDF:** attach a PDF to the record, or use `/documents/upload` for the signed-upload entry path. Read the actual response and show SIGNED. Replace a copy with PUT and required reason; preserve historical copies through the signed-copies endpoint.
5. **File and finalize:** use book/Doc.No./Page.No. contract rules at the operation where they are documented. OPEN supports current filing; CLOSED supports physical-register migration with explicit paper numbers. Do not blindly filter CLOSED out. Finalize from the supported signed state and server permissions; this is where snapshot/chain processing occurs.
6. **Verify:** trust the backend verdict. AUTHENTIC, TAMPERED, SNAPSHOT_COMPROMISED, NOT_ANCHORED and VERIFICATION_UNAVAILABLE are distinct. A failed verification must never be rendered as proof of tampering. Preserve the existing verdict UI where aligned; remove unsupported restore promises.
7. **Manage books:** allow OPEN/CLOSED creation when needed for physical migration; close OPEN books with confirmation and refresh list/detail. No reopen operation exists. Delete only empty books: successful deletion is bodyless 204, populated books return409. Replace the current claim that deletion removes all documents (`books-page.tsx:103`).

Example response mapping for a closed book (illustrative contract data, not a captured live response):

```json
{"id":"11111111-1111-4111-8111-111111111111","book_number":2,"series_year":2026,"status":"CLOSED","entry_count":12,"last_doc_no":12,"last_page_no":9,"closed_at":"2026-10-08T00:00:00Z","created_at":"2026-01-01T00:00:00Z","updated_at":null}
```

The card should display Closed, 12 entries, last document 12, last page 9. It must not display Full, Active, or nine total pages. A closed book can still be chosen for supported explicit paper filing.

### Unsupported frontend calls and removed operations

Removed since Git HEAD: `POST /documents/{document_id}/update`, `GET /documents/{document_id}/versions`, `POST /documents/{document_id}/restore`. Existing version helpers still call the first two (`src/features/documents/document-lifecycle-api.ts:52`); the verification page still calls restore (`src/features/documents/pages/documents-id-verify-page.tsx:22`). Signed-copy replacement/history and lifecycle history are separate concepts and need truthful labels, not automatic one-to-one aliases.

Also undocumented here: document audit logs, snapshot list/restore, blockchain record lookup, and `/requests` flows. See `src/features/access/portal-access-api.ts:39`, `src/features/documents/document-lifecycle-api.ts:67`, `src/app/api/portal/blockchain/record/[id]/route.ts:27`, and `src/features/access/pages/requests-my-page.tsx:21`. Their presence in frontend source or mocks does not prove live backend support.

### Existing GitHub plan reassessment

These are review findings; GitHub issue bodies and statuses were not modified in this audit.

| Issue | Current assessment |
| --- | --- |
| #48 parent spec | Based on the earlier local checkout; reconcile it against this live-contract section before execution. |
| #49 role bootstrap | Current source already contains the role-provider change. Its missing-profile rationale is stale because `/users/` is documented. Check acceptance coverage before closing. |
| #50 signup/resend | Ordinary signup and resend changes appear present. Remaining review items include upstream201 forwarding and truthful verification landing behavior. |
| #51 sign-out | Still needed; change its target from `/auth/logout` to `/auth/signout`. |
| #52 book display | Still needed, including shared upload book consumers. |
| #53 create/delete | Still needed for safe delete copy; account for CLOSED physical migration and backend conflicts. |
| #54 close book | Still needed; CLOSED does not mean unfileable. |

New lifecycle, Google and account-active integrations exceed the original auth/books ticket scope. Order frontend work as contract generation → book/document response mapping → supported lifecycle and transport methods → Google/drafts/comments → account mutations → unsupported-control cleanup. Preserve existing layout, navigation and accessible controls. Add screen-level coverage as previously requested; do not add backend changes or new API-route test suites to that plan.

### Verification performed

Compared the current JSON with Git HEAD, inspected source callers/adapters and both generated outputs, and read the current GitHub tickets. **`pnpm typecheck` passed.** This passes against the currently consumed old schema, so it does not prove alignment with the updated contract. No browser session, authenticated live endpoint execution, screen test suite or backend mutation was performed.

### Complete current endpoint checklist

All 57 operations are listed below. **Called** means a non-test frontend caller exists, not that its whole flow is aligned; consult the findings above. **Missing** means no established frontend operation. OAuth callback is backend-owned. Parameters include path/query inputs; JSON/multipart bodies name the authoritative schema in `openapi-updated.json`. Error responses without schemas cannot establish detailed runtime error JSON.

| Method and path | Coverage | Inputs | Documented responses |
| --- | --- | --- | --- |
| `POST /auth/signup` | Called; review flow | application/json: SignUpRequest | 201: SignUpResponse; 400: Invalid input or user already exists; 422: HTTPValidationError; 429: unspecified; 502: Failed to connect to Supabase |
| `POST /auth/signin` | Called; review flow | application/json: SignInRequest | 200: SignInResponse; 401: Invalid credentials, email not verified, or account deactivated; 422: HTTPValidationError; 429: unspecified; 502: Failed to connect to Supabase |
| `POST /auth/signout` | Missing | No declared body/query | 200: MessageResponse; 401: Not authenticated — missing or invalid bearer token; 502: Failed to connect to Supabase — the session was NOT revoked |
| `POST /auth/resend-verification` | Called; review flow | application/json: ResendVerificationRequest | 200: MessageResponse; 422: HTTPValidationError; 429: unspecified |
| `GET /users/search` | Missing | email (query, required) | 200: UserSearchResponse; 401: User is not authenticated; 404: unspecified; 422: HTTPValidationError |
| `GET /users/` | Called; review flow | No declared body/query | 200: UserProfileResponse; 401: User is not authenticated; 404: unspecified |
| `GET /documents/` | Called; review flow | limit (query optional); offset (query optional); lifecycle (query optional) | 200: DocumentUploadResponse[]; 401: Not authenticated — missing or invalid bearer token; 422: HTTPValidationError |
| `POST /documents/` | Missing | application/json: OpenDocumentRequest | 201: DocumentResponse; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only lawyers may open documents; 422: HTTPValidationError |
| `POST /documents/upload` | Called; review flow | file_name (query, required); book_id (query, required); doc_no (query optional); page_no (query optional); confirm_new_record (query optional); multipart/form-data: Body_upload_document_documents_upload_post | 201: DocumentResponse; 400: Empty file, unsupported file type, file exceeds size limit, or register numbers missing/out of range; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only lawyers may upload documents; 404: Book not found; 409: Same file already filed, Doc. No. taken, page full, or documents waiting for a signed copy; 422: HTTPValidationError |
| `GET /documents/{document_id}` | Called; review flow | document_id (path, required) | 200: DocumentResponse; 401: Not authenticated — missing or invalid bearer token; 404: Document not found or user has no access; 422: HTTPValidationError |
| `PATCH /documents/{document_id}` | Called; review flow | document_id (path, required); application/json: UpdateDocumentRequest | 200: DocumentResponse; 403: Forbidden — only the document owner may rename; 404: Document not found; 409: Finalized or cancelled; 422: HTTPValidationError |
| `POST /documents/{document_id}/draft` | Missing | document_id (path, required); application/json: CreateDraftRequest | 201: DocumentResponse; 400: No file picked, or the picked file is not a Google Doc; 403: Forbidden — only the document owner may create the draft; 404: Document not found; 409: Not PREPARING, a draft already exists, or Google is not connected (`GOOGLE_NOT_CONNECTED`); 422: HTTPValidationError; 502: Google Drive is unreachable |
| `GET /documents/{document_id}/comments` | Missing | document_id (path, required) | 200: DraftCommentListResponse; 404: Document not found; 422: HTTPValidationError |
| `POST /documents/{document_id}/comments/sync` | Missing | document_id (path, required) | 200: DraftCommentListResponse; 404: Document not found; 409: The lawyer's Google account is not connected; 422: HTTPValidationError; 502: Google Drive is unreachable |
| `POST /documents/{document_id}/ready` | Missing | document_id (path, required) | 200: DocumentResponse; 422: HTTPValidationError |
| `POST /documents/{document_id}/reopen` | Missing | document_id (path, required) | 200: DocumentResponse; 422: HTTPValidationError |
| `POST /documents/{document_id}/cancel` | Missing | document_id (path, required) | 200: DocumentResponse; 422: HTTPValidationError |
| `POST /documents/{document_id}/signed-copy` | Missing | document_id (path, required); book_id (query, required); doc_no (query optional); page_no (query optional); multipart/form-data: Body_attach_signed_copy_documents__document_id__signed_copy_post | 200: DocumentResponse; 422: HTTPValidationError |
| `PUT /documents/{document_id}/signed-copy` | Missing | document_id (path, required); multipart/form-data: Body_replace_signed_copy_documents__document_id__signed_copy_put | 200: DocumentResponse; 422: HTTPValidationError |
| `GET /documents/{document_id}/signed-copies` | Missing | document_id (path, required) | 200: SignedCopyListResponse; 422: HTTPValidationError |
| `PATCH /documents/{document_id}/entry` | Missing | document_id (path, required); application/json: CorrectEntryRequest | 200: DocumentResponse; 422: HTTPValidationError |
| `GET /documents/{document_id}/history` | Missing | document_id (path, required) | 200: DocumentHistoryResponse; 422: HTTPValidationError |
| `GET /documents/invitations/mine` | Called; review flow | No declared body/query | 200: DocumentInvitationListResponse; 401: Not authenticated — missing or invalid bearer token |
| `POST /documents/invitations/{invitation_id}/accept` | Called; review flow | invitation_id (path, required) | 200: DocumentInvitationActionResponse; 401: Not authenticated — missing or invalid bearer token; 404: Invitation not found or addressed to someone else; 409: Already accepted or declined; 422: HTTPValidationError |
| `POST /documents/invitations/{invitation_id}/decline` | Called; review flow | invitation_id (path, required) | 200: DocumentInvitationActionResponse; 401: Not authenticated — missing or invalid bearer token; 404: Invitation not found or addressed to someone else; 409: Already accepted or declined; 422: HTTPValidationError |
| `GET /documents/{document_id}/parties` | Called; review flow | document_id (path, required) | 200: DocumentPartyListResponse; 401: Not authenticated — missing or invalid bearer token; 404: Document not found or user has no access; 422: HTTPValidationError |
| `POST /documents/{document_id}/parties` | Called; review flow | document_id (path, required); application/json: AddPartyRequest | 201: DocumentPartyResponse; 400: User does not exist, or role is invalid for this user; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only the document owner may add parties; 404: Document not found; 422: HTTPValidationError |
| `DELETE /documents/{document_id}/parties/{party_user_id}` | Called; review flow | document_id (path, required); party_user_id (path, required) | 200: RemovePartyResponse; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only the document owner may remove parties; 404: Document or party not found; 422: HTTPValidationError |
| `POST /documents/{document_id}/finalize` | Called; review flow | document_id (path, required) | 200: RecordResponse; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only the document owner may finalize; 404: Document not found; 409: Not SIGNED, or the stored file no longer matches the upload; 422: HTTPValidationError |
| `GET /documents/{document_id}/verify` | Called; review flow | document_id (path, required) | 200: DocumentVerificationResponse; 401: Not authenticated — missing or invalid bearer token; 404: Document not found, or it has no on-chain record; 422: HTTPValidationError |
| `GET /documents/{document_id}/extraction` | Called; review flow | document_id (path, required) | 200: ExtractionReviewResponse; 401: Not authenticated — missing or invalid bearer token; 404: Document not found, or it has no extraction yet; 422: HTTPValidationError |
| `PATCH /documents/{document_id}/extraction` | Called; review flow | document_id (path, required); application/json: UpdateExtractionRequest | 200: ExtractionReviewResponse; 400: Unknown block index, or nothing reviewable; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only the document owner may edit; 404: Document not found, or it has no extraction yet; 409: Already approved, or document is not awaiting review; 422: HTTPValidationError |
| `POST /documents/{document_id}/extraction/analyze` | Called; review flow | document_id (path, required) | 200: ExtractionReviewResponse; 400: Nothing reviewable in this extraction; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only the document owner may run this; 404: Document not found, or it has no extraction yet; 409: Already approved, or document is not awaiting review; 422: HTTPValidationError |
| `POST /documents/{document_id}/extraction/approve` | Called; review flow | document_id (path, required) | 200: ApproveExtractionResponse; 400: Approved text is empty; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only the document owner may approve; 404: Document not found, or it has no extraction yet; 409: Already approved, or document is not awaiting review; 422: HTTPValidationError |
| `POST /documents/{document_id}/search` | Missing | document_id (path, required); application/json: SearchRequest | 200: SearchResponse; 422: HTTPValidationError |
| `POST /documents/{document_id}/ask` | Called; review flow | document_id (path, required); application/json: AskRequest | 200: unspecified JSON; 422: HTTPValidationError |
| `POST /search` | Called; review flow | application/json: SearchRequest | 200: GlobalSearchResponse; 422: HTTPValidationError |
| `GET /admin/dashboard` | Called; review flow | No declared body/query | 200: AdminDashboardResponse; 403: Not a lawyer |
| `GET /admin/users` | Called; review flow | No declared body/query | 200: AdminUserListResponse; 403: Not a lawyer |
| `GET /admin/invitations` | Called; review flow | No declared body/query | 200: InvitationListResponse; 403: Not a lawyer |
| `POST /admin/invitations` | Called; review flow | application/json: CreateInvitationRequest | 201: InvitationResponse; 400: Invitation already exists; 403: Not a lawyer; 422: HTTPValidationError |
| `DELETE /admin/invitations/{invitation_id}` | Called; review flow | invitation_id (path, required) | 204: Revoked; 403: Not a lawyer; 404: Not found; 422: HTTPValidationError |
| `PATCH /admin/users/{user_id}/active` | Missing | user_id (path, required); application/json: SetUserActiveRequest | 200: AdminUserResponse; 400: Would lock out the last lawyer, or is yourself; 403: Not a lawyer; 404: User not found; 422: HTTPValidationError |
| `GET /notifications/` | Called; review flow | limit (query optional); offset (query optional); unread_only (query optional) | 200: NotificationListResponse; 401: Not authenticated; 422: HTTPValidationError |
| `GET /notifications/unread-count` | Called; review flow | No declared body/query | 200: UnreadCountResponse; 401: Not authenticated |
| `PATCH /notifications/{notification_id}/read` | Called; review flow | notification_id (path, required) | 204: Marked as read; 401: Not authenticated; 404: Not found or not yours; 422: HTTPValidationError |
| `PATCH /notifications/read-all` | Called; review flow | No declared body/query | 200: MarkAllReadResponse; 401: Not authenticated |
| `GET /books/` | Called; review flow | limit (query optional); offset (query optional) | 200: BookResponse[]; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only lawyers may access books; 422: HTTPValidationError |
| `POST /books/` | Called; review flow | application/json: BookCreateRequest | 201: BookResponse; 400: Book number already used for that year, or another book for that year is still open; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only lawyers may create books; 422: HTTPValidationError |
| `GET /books/{book_id}` | Called; review flow | book_id (path, required) | 200: BookResponse; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only lawyers may access books; 404: Book not found; 422: HTTPValidationError |
| `DELETE /books/{book_id}` | Called; review flow | book_id (path, required) | 204: Book deleted; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only lawyers may delete books; 404: Book not found; 409: Book still holds documents; 422: HTTPValidationError |
| `POST /books/{book_id}/close` | Missing | book_id (path, required) | 200: BookResponse; 401: Not authenticated — missing or invalid bearer token; 403: Forbidden — only lawyers may close books; 404: Book not found; 409: Book is already closed; 422: HTTPValidationError |
| `POST /google/connect` | Missing | No declared body/query | 200: GoogleConnectResponse |
| `GET /google/callback` | Backend OAuth redirect; frontend landing missing | code (query optional); state (query optional); error (query optional) | 302: unspecified JSON; 422: HTTPValidationError |
| `GET /google/connection` | Missing | No declared body/query | 200: GoogleConnectionStatus |
| `DELETE /google/connection` | Missing | No declared body/query | 204: Successful Response |
| `GET /google/picker-token` | Missing | No declared body/query | 200: GooglePickerToken |

Use each referenced schema for required fields, nullability and enums. A backend OAuth callback must not be treated as an ordinary bearer proxy operation. Its browser return should refresh `/google/connection`; the server-owned Google refresh token stays off the client. The Picker endpoint intentionally supplies a short-lived scoped access token for that browser capability, not the LexChain session token.

## Historical local-backend review (superseded for live-contract planning)

Reviewed 2026-10-08. This is a source-based integration guide for the frontend in this repository and the nested `lexchain_backend` checkout. It describes what is implemented in that checkout, what the frontend calls, the contract saved with the frontend, and how the existing screens should consume the data without changing their layout or interaction model.

No backend server, database, migration, live API request, or frontend test was run for this review. No `.env` values or credentials were read. Treat runtime behavior, deployed backend behavior, and any operation that is not registered in the local backend as unverified.

## Read this first

The directory `lexchain_backend` is a separate Git checkout, intentionally ignored by the frontend repository. It is present here as temporary reference material so its routes and schemas can be inspected when backend OpenAPI documentation is unavailable. At review time it was on branch `main` with a clean worktree. It is not part of the frontend application, build, or deployment; do not copy or import backend source into the frontend. The frontend connects to the separately hosted service through its API.

The local backend registers **nine application operations**: signup, signin, logout, resend verification, and five book operations. The frontend has **40 operations in its checked-in OpenAPI snapshot**; only seven method/path pairs match the local backend. In addition, the frontend source makes **36 active calls** to methods that are not registered in this backend checkout. A saved schema or a screen that renders mock data does not prove the deployed service supports an operation.

This guide uses three evidence labels:

| Label | Meaning |
| --- | --- |
| **Local backend implementation** | A route is included by `lexchain_backend/backend/src/app/main.py` and has executable router/service code in that checkout. |
| **Frontend contract** | Request/response shapes come from `openapi-updated.json`, the generated types, or the frontend caller's own TypeScript type. This may describe a different backend revision. |
| **Integration recommendation** | Suggested screen behavior for connecting a future/other backend implementation. It is not evidence that the local backend implements it. |

The nested backend is the only backend source inspected here. Do not generalize its nine routes to a separately deployed API without checking that API's version and OpenAPI document.

## Architecture and ownership

The intended web request path is:

```mermaid
sequenceDiagram
    participant UI as Browser feature screen
    participant Next as Same-origin Next.js route handler
    participant API as External FastAPI backend
    participant Data as Backend service and persistence
    UI->>Next: Feature request; browser sends same-origin cookies
    Next->>Next: Read server-held token; validate/shape request
    Next->>API: Preserve method, path, body, headers; add Bearer token
    API->>Data: Authoritative authorization and domain operation
    Data-->>API: Persisted result or domain error
    API-->>Next: Status, headers, JSON or empty response
    Next-->>UI: Same-origin response with the established contract
```

- Browser code should use the existing same-origin API clients and Next route handlers. Portal handlers read the server-held portal token; admin handlers use the issuer token. The browser should not receive a backend secret or construct the backend URL.
- Server-rendered views and Server Actions may use `src/server/api/backend.ts` or the existing feature-owned server helpers directly. Keep their credentials and network calls server-only.
- The backend owns persistence, role authorization, document processing, storage, audit history and blockchain operations. The frontend owns presentation, form state, navigation, pending feedback and mapping domain statuses to accessible UI.
- The local FastAPI routes return JSON or an empty `204`; they do not set browser cookies. Next handlers own the browser cookie boundary.
- Keep authenticated responses out of service-worker/cache storage. Preserve status codes, structured error bodies, `WWW-Authenticate`, retry headers, multipart boundaries and `204` behavior when proxying.

## Current local backend API: implemented operations

Only the accounts and books routers are registered (`lexchain_backend/backend/src/app/main.py:93-94`). All protected routes require a valid Bearer JWT for an active, provisioned local user. `LawyerUser` requires the exact database role `lawyer`; frontend aliases such as `admin` or `document_issuer` do not grant backend permission.

FastAPI's default discovery UI is also expected to expose `GET /openapi.json`, `GET /docs`, `GET /docs/oauth2-redirect`, and `GET /redoc` when the app runs with its current constructor defaults. These are framework-generated inspection routes, not LexChain feature endpoints; they were inferred from `FastAPI(...)` configuration and were not checked against a running server.

### Authentication

#### `POST /auth/signup`

- **Access:** public.
- **Request:** JSON with all four fields `email`, `password`, `f_name`, `l_name`.
- **Example:**

  ```json
  {
    "email": "jane@example.com",
    "password": "Password1",
    "f_name": "Jane",
    "l_name": "Doe"
  }
  ```

- **Success:** `201 SignUpResponse` with `message`, local `user_id`, normalized `email`, and `requires_email_confirmation`.
- **Illustrative response:**

  ```json
  {
    "message": "Account created successfully. Please check your email to verify your account.",
    "user_id": "<local-user-uuid>",
    "email": "jane@example.com",
    "requires_email_confirmation": true
  }
  ```

- **Validation and logic:** name fields are 1–50 characters, start with a letter, and allow letters, spaces, hyphens and apostrophes. Password is at least eight characters and must include uppercase, lowercase and a digit. The service creates the Supabase account and syncs a local user. Local sync failure triggers an attempted Supabase deletion; the later database commit is outside that compensation block.
- **Expected errors:** 400 account conflict/business error, 422 invalid body, 429 rate limit, 502 Supabase failure, or 500 unexpected failure.
- **Frontend:** `/register` sends the required fields plus `phone_number` and, when present, invitation `token`. This backend schema has neither field, so this checkout does not save the phone or consume the invitation token. Agree on those fields before relying on invitation registration.
- **Sources:** `backend/src/app/features/accounts/{router.py,schemas.py,service.py}`; `backend/src/app/shared/utils/validators.py`.

#### `POST /auth/signin`

- **Access:** public.
- **Request:** `{"email":"jane@example.com","password":"Password1"}`.
- **Success:** `200 SignInResponse`: `access_token`, `refresh_token`, `token_type`, `expires_in`, and `user: { id, email, role }`. `user.id` is the local database UUID. Token duration comes from Supabase; do not hardcode the illustrative value below.
- **Illustrative response:**

  ```json
  {
    "access_token": "<access-jwt>",
    "refresh_token": "<refresh-token>",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "<local-user-uuid>",
      "email": "jane@example.com",
      "role": "lawyer"
    }
  }
  ```

- **Logic:** authenticates with Supabase, synchronizes the local account, rejects a missing/inactive local user and returns the role from the local database. The backend has no refresh route/service in this checkout.
- **Expected errors:** 401 invalid credentials or unverified account, 422 invalid input, 429 limit, 502 Supabase failure, 500 unexpected failure.
- **Frontend:** `src/app/api/auth/route.ts` calls this route and stores credentials in server-side cookies. The returned role means the `/users/` role lookup is not required just to complete signin.
- **Sources:** `backend/src/app/features/accounts/{router.py,schemas.py,service.py}`.

#### `POST /auth/logout`

- **Access:** authenticated Bearer token; no body.
- **Success:** `200 {"message":"Signed out successfully."}`.
- **Logic:** asks Supabase to revoke sessions globally. The current access JWT remains usable until it expires because requests validate its signature/claims and then resolve the local user; the frontend must still discard its own access and refresh token copies.
- **Expected errors:** 401, 403 inactive user, 422, 429, 502 upstream failure, or 500.
- **Frontend gap:** current portal and admin logout routes clear local cookies without calling backend `/auth/logout`. Calling backend logout should be added without making local cookie cleanup depend on upstream availability.
- **Sources:** `backend/src/app/features/accounts/{router.py,service.py}`; `src/app/api/portal/logout/route.ts`.

#### `POST /auth/resend-verification`

- **Access:** public.
- **Request:** `{"email":"jane@example.com"}`.
- **Success:** `200 {"message":"If that address has an unverified account, a verification email has been sent. Please check your inbox."}`.
- **Logic:** calls Supabase resend. Upstream errors are logged and mapped to the same neutral message; **HTTP 200 does not prove an email was delivered**.
- **Frontend:** `src/app/api/portal/resend-verification/route.ts` forwards the email. Show the neutral next step, not a claim that delivery was confirmed.
- **Sources:** `backend/src/app/features/accounts/{router.py,schemas.py,service.py}`.

### Books

All book routes require the exact role `lawyer` and scope reads/writes to the authenticated owner. Book numbers are 1–1000; series year must be at least 2000. For one owner/year, book numbers are unique and only one book may be `OPEN`. `POST /books/` accepts optional `status: OPEN | CLOSED`, defaulting to `OPEN`.

Current backend response example:

```json
{
  "id": "<book-uuid>",
  "book_number": 1,
  "series_year": 2026,
  "status": "OPEN",
  "closed_at": null,
  "entry_count": 0,
  "last_doc_no": null,
  "last_page_no": null,
  "created_at": "<ISO-8601 datetime>",
  "updated_at": null
}
```

| Endpoint | Request and success | Behavior, errors and screen |
| --- | --- | --- |
| `GET /books/?limit=50&offset=0` | Query `limit` 1–100 (default 50), `offset` ≥0 (default 0). Returns `200 BookResponse[]`, including `[]` when empty. There is no total/pagination wrapper. | `/portal/books` and `/portal/upload` call it. 401 means session is invalid; 403 means the account is not a lawyer. The source query computes register aggregates and references missing `Document.is_latest` (see risks), so list runtime is not confirmed. |
| `POST /books/` | `{"book_number":1,"series_year":2026,"status":"OPEN"}`; returns `201 BookResponse`. | Books screen form. Duplicate volume or a second open book for the year returns 400; keep form values and present a field-level/actionable message. Validation can return 422. |
| `GET /books/{book_id}` | UUID path; returns `200 BookResponse`. | Used in book management. Nonexistent and not-owned books return 404. |
| `POST /books/{book_id}/close` | UUID path; no body; returns `200 BookResponse` with `status=CLOSED`, `closed_at`. | Implemented by backend but not in frontend OpenAPI or current UI. If added, use a confirmation in book management, disable duplicate submission, then update the same book row/status. Already closed returns 409. Historical filing with explicit document/page numbers is allowed in internal service logic; decide with product/backend whether the upload form should still offer a closed book for that case. |
| `DELETE /books/{book_id}` | UUID path; no body; returns `204` with an empty body. | Books screen already calls this. Backend allows deleting only empty books; any document/version in the book returns 409. Show a conflict-specific message; do not call `response.json()` on 204. |

### Shared local-backend error and auth behavior

The common error JSON is:

```json
{
  "error_type": "<error-category>",
  "message": "<human-readable message>",
  "status_code": 422,
  "details": {
    "errors": ["<validation issue objects>"]
  },
  "timestamp": "<ISO-8601 datetime>"
}
```

For non-validation errors, `details` can be empty or contain domain-specific data. Treat the example as a shape guide: exact messages, error categories and validation objects vary. Preserve the backend status code and `WWW-Authenticate: Bearer` on 401. Rate-limited responses include retry/backoff headers; honor them rather than immediately retrying. Typical local limits are 5 signups/hour, 5 signins/minute, 20 logouts/minute, 3 verification emails/hour, plus a 100/minute default. Backend IP counters are process-local.

The checked-in frontend OpenAPI describes validation under `detail`, while this backend emits `message` plus `details.errors`. TypeScript types do not validate incoming JSON. The UI should read the backend error envelope defensively and fall back to a safe generic error if the payload is not valid JSON.

## Frontend endpoint inventory: active calls with no local backend route

Every endpoint in this section is called by current frontend source, but **none is registered in this local backend checkout**. The request/response types below describe the frontend's saved contract or caller types. They are targets to reconcile with the backend owner, not proof of availability. A request returning 404 against this checkout is expected until the route is implemented or the configured backend points to a compatible service.

### Profile

| Endpoint | Frontend request and expected result | Screen placement |
| --- | --- | --- |
| `GET /users/` | No body. Frontend expects `UserProfileResponse`: `email`, `f_name`, `l_name`, `role`, and optional `avatar`/`mfa_enabled`. No matching user router exists here. | Portal shell, profile/account/security pages, document access checks, upload, request/invitation pages. Profile failure must not be represented as a valid empty profile or silently grant UI access. Backend authorization remains authoritative. |

### Documents: library, upload, detail and versions

| Endpoint | Frontend request and expected result | Screen placement |
| --- | --- | --- |
| `GET /documents/?limit=…&offset=…` | Optional pagination; saved contract returns `DocumentUploadResponse[]`. List item uses `id`, `file_name`, `status`, `on_chain`, `version`, `is_latest`, `lifecycle`, ownership/party metadata. | `/portal/documents`, dashboard recent documents, report summaries. Empty list is a true empty state only after a successful response; a failed request needs an error/retry state. |
| `GET /documents/{document_id}` | UUID path; saved contract returns `DocumentResponse`, whose identifier is `document_id` (different from list's `id`). Includes file/status/lifecycle/version, hashes, `permissions`, summary/labels/entities/risk flags, timestamps and storage URL. | `/portal/documents/[id]`, activity, processing, viewer, participants, ask and verification. Only show actions allowed by the backend response; frontend role checks are presentation, not authorization. |
| `POST /documents/upload?book_id={uuid}&file_name={name}` | `multipart/form-data`, PDF in field `file`; saved contract expects **202** `DocumentUploadAcceptedResponse { document_id, status, message }`. Keep multipart boundary intact in the Next proxy. | `/portal/upload`. On 202 show accepted/processing feedback and navigate to `/portal/upload/processing?id=…` using the returned `document_id`; acceptance is not proof OCR/finalization succeeded. Preserve selected PDF/title/book on failure. |
| `POST /documents/{document_id}/update?file_name={name}` | Multipart PDF field `file`; saved contract expects 202 `DocumentUploadAcceptedResponse`. New version must only be appended to the latest version; a finalized version remains immutable. | “Upload new version” on `/portal/documents/[id]`. Current page discards the returned document ID and does not invalidate the versions/list caches; integration should use the accepted ID and refresh document, list and version history. |
| `GET /documents/{document_id}/versions` | No body; `VersionHistoryResponse { current_document_id, root_document_id, latest_document_id, versions, total_version }`. The caller consumes history newest to oldest, including latest/finalized metadata. | Version history in document workspace. Distinguish latest from finalized; do not permit overwriting an immutable finalized version. Show an explicit empty/single-version state. |
| `PATCH /documents/{document_id}` | JSON `{"file_name":"Updated display name.pdf"}` (`RenameDocumentRequest`); saved contract returns a `DocumentUploadResponse`. Contract says only owner/admin may rename and only while draft. | Rename action on `/portal/documents/[id]`. Keep the current name if request fails; update the list/detail cache after success. Backend must enforce the draft/owner rule. |

### Documents: extraction, review and finalization

| Endpoint | Frontend request and expected result | Screen placement |
| --- | --- | --- |
| `GET /documents/{document_id}/extraction` | No body; `ExtractionReviewResponse` supplies document/extraction IDs, file, page count, OCR `blocks`, `flags`, counts, review status and storage URL. | `/portal/documents/[id]/review`. Render PDF pages with OCR blocks and flags; show loading, no-extraction/404, permission and retry states separately. |
| `PATCH /documents/{document_id}/extraction` | JSON `{"edits":[{"index":12,"text":"Corrected text"}]}`; nested edit shape follows `UpdateExtractionRequest`. Returns updated `ExtractionReviewResponse`. Saved contract says raw OCR stays immutable and edits are a review overlay. | Review screen. Preserve unsaved text after failure. Save is repeatable and does not approve; refresh flags and edited-block counts from the response. Handle 409 stale review by refreshing before further edits. |
| `POST /documents/{document_id}/extraction/analyze` | No body; returns `ExtractionReviewResponse` with semantic flags. Contract says it is optional and rerunning replaces the previous LLM pass. | “Analyze” action on review screen. Show pending state and cost/latency expectation if the product chooses; preserve current edited text while analysis runs and replace only analysis results. |
| `POST /documents/{document_id}/extraction/approve` | No body; `ApproveExtractionResponse { document_id, status, edited_block_count, content_hash, message }`. | Review screen’s irreversible/confirm action. Confirm before freezing reviewed text; after success show approved state and invalidate extraction, detail and list data. The contract says chunking/embedding/analysis is queued only after approval. |
| `POST /documents/{document_id}/finalize` | No body; saved contract returns `RecordResponse { document_id, tx_hash, onchain_document_id, data_hash }`. | Finalize action in document workspace. Keep the existing confirmation, disable duplicate submissions, show pending chain operation and success/error distinctly. Contract says this is the only on-chain hash point; do not separately trigger the Next `/blockchain/record/{id}` helper unless the backend contract explicitly requires it. |

### Documents: verification and restore

| Endpoint | Frontend request and expected result | Screen placement |
| --- | --- | --- |
| `GET /documents/{document_id}/verify` | No body; `DocumentVerificationResponse` includes server-computed `status`, `is_authentic`, `baseline_trusted`, hashes, chain transaction/time, `verified_at`, message, and optional `tamper_report`. | `/portal/documents/[id]/verify`. Render server verdict, not a client-side hash guess. Distinguish `AUTHENTIC`, `TAMPERED`, `SNAPSHOT_COMPROMISED`, `NOT_ANCHORED` and `VERIFICATION_UNAVAILABLE`; unknown/unavailable is not a tamper verdict. Render changed sections only when the report is present and localized. |
| `POST /documents/{document_id}/restore` | No body; saved contract returns `RestoreResponse { document_id, restored_from, evidence_key, verified_hash, message }`. Operation is slow because the archived original is re-read and OCR-verified against the chain first. | Manual action from verification after the lawyer reviews the comparison. Require confirmation, pending feedback and failure recovery. Preserve the replaced file as evidence; refresh detail and verification results after success. |

### Document parties and invitations

| Endpoint | Frontend request and expected result | Screen placement |
| --- | --- | --- |
| `GET /documents/{document_id}/parties` | No body; `DocumentPartyListResponse { document_id, issuer, parties }`. Party rows include user ID, name/email, role, status and response/timestamps. | `/portal/documents/[id]/participants`. Show issuer separately from invited/shared parties. |
| `POST /documents/{document_id}/parties` | JSON `{"email":"person@example.com","role":"viewer"}`; role is `viewer`, `signer` or `editor`; saved contract returns 201 `DocumentPartyResponse`. Signer/editor are restricted to lawyers by the contract. | Add participant form. Keep input on validation/network failure. Do not show access as active while invitation is pending. |
| `DELETE /documents/{document_id}/parties/{party_user_id}` | No body; saved contract returns 200 `RemovePartyResponse { document_id, user_id, message }`. | Revoke action in participants table; confirm first, show pending state, then remove/invalidate after success. |
| `GET /documents/invitations/mine` | No body; `DocumentInvitationListResponse { invitations, total }`. Pending invitations grant no document access. | `/portal/invitations`. Show document, inviter/role and accept/decline actions. Pending invitation must not make the document appear in the library. |
| `POST /documents/invitations/{invitation_id}/accept` | No body; 200 `DocumentInvitationActionResponse { invitation_id, document_id, status, message }`. | Accept action on invitation card. On success invalidate invitations and document list, then link/open the newly shared document. |
| `POST /documents/invitations/{invitation_id}/decline` | No body; same response schema as accept. | Decline action. On success remove or mark the invitation declined; do not grant document access. |
| `GET /documents/{document_id}/audit-logs` | No body; current caller expects `PortalAuditLog[]`, each with `id`, `document_id`, optional `user_id`, `action`, optional `details`, `created_at`. This call is not in the saved OpenAPI snapshot. | `/portal/documents/[id]/activity`. Sort by backend timestamps and show actor/action/details. A 404/403/network error must not look like an empty history. |

### Requests, search and document questions

These request-management routes are active in frontend source but are absent from both the saved OpenAPI operation list and this backend checkout. Their shape below is derived from current caller types and bodies; the backend contract still needs to be agreed.

| Endpoint | Current frontend contract | Screen placement |
| --- | --- | --- |
| `GET /requests` or `GET /requests?status=pending\|approved\|rejected` | Caller expects `{ requests: PortalDocumentRequest[], total }`. A request has `id`, requester ID/email/name, document ID/optional name, description, status, optional lawyer ID/rejection reason, and created/updated times. | `/portal/requests`, issuer queue with status filters. Show pending requests with approve/reject actions, approved/rejected as history. Do not convert 401/404/backend outage into “No requests found.” |
| `GET /requests/my` | Same list shape, scoped by backend to current user. | `/portal/requests/my`, user’s e-copy request history. Show status and rejection reason; backend must enforce ownership. |
| `PATCH /requests/{request_id}/review` | JSON `{"action":"approve"}` or `{"action":"reject","rejection_reason":"Please provide the required authorization."}`. Current UI requires a nonempty reason to reject and invalidates the queue after success; response body is ignored. Backend needs a defined response and allowed state transitions. | `/portal/requests`. Confirm rejection, disable the selected row while pending, retain rejection text on failure, and update only after success. |
| `POST /search` | JSON `{"query":"lease renewal date"}`; saved contract returns `GlobalSearchResponse { query, results }`, with document/chunk identifiers and ranking. The active UI also reads an optional text snippet that the saved schema does not define (see below). | `/portal/search` and portal search bar. Preserve query in the URL, display loading, no-results, and error separately; never make rank score look like a legal conclusion. |
| `POST /documents/{document_id}/ask` | JSON `{"question":"What date does the agreement renew?"}`. The frontend accepts `answer`, `response` or `message` fallback; the saved OpenAPI response does not define a body. Agree a canonical response with citations/source snippets before relying on it. | `/portal/documents/[id]/ask` and document chatbot. Keep conversation/question visible during failure; identify the source document and make clear this is an assisted answer, not a verified document fact. |

### Notifications

| Endpoint | Frontend request and expected result | Screen placement |
| --- | --- | --- |
| `GET /notifications/?limit=…&offset=…&unread_only=…` | Saved contract returns `{ notifications, total }`; item fields: `id`, `type`, `title`, `body`, `is_read`, `event_metadata`, `created_at`. | `/portal/notifications` and portal shell inbox/count. Empty inbox is only shown after a successful request. Current page ignores query errors and can render an empty list; integrate an explicit error/retry state. |
| `GET /notifications/unread-count` | Saved contract returns `{ unread: number }`. | Portal header badge. Keep the count separate from list pagination; refresh/invalidate on read actions. |
| `PATCH /notifications/{notification_id}/read` | No body; saved contract says 204 empty response. | Mark one unread row read. Current page invalidates the list after success; also invalidate the header count. |
| `PATCH /notifications/read-all` | No body; saved contract returns `{ marked_read: number }`. | “Mark all as read” on notification page/header. Disable while pending, then refresh list and badge. |

### Administration

The local backend has no `/admin/*` router. In the frontend, some administration screens use `adminFetch` while others are explicitly local demo fixtures; a screen in the admin shell does not mean it is backed by an API.

| Endpoint | Frontend request and expected result | Screen placement |
| --- | --- | --- |
| `GET /admin/dashboard` | No body; saved contract returns `AdminDashboardResponse` counts for users, lawyers, documents, processing, failures, on-chain and pending invitations. | `/portal/dashboard` (legacy `/admin/dashboard` redirects). Show unavailable separately from zeros. Current server action returns an error object; dashboard and loading UI should not display error as empty metrics. |
| `GET /admin/users` | No body; `{ users: AdminUserResponse[], total }`; user fields include ID, email, names, role, active state and created time. | `/portal/users` (legacy `/admin/users` redirects). Search/filter/pagination must use backend-authoritative data; retain explicit loading, empty, failure and unauthorized states. |
| `GET /admin/invitations` | No body; saved contract returns `{ invitations: InvitationResponse[] }`. | `/portal/issuer-invitations` and invitations management. Display status and expiry from backend. Current server view can return an empty collection after an error, which hides failures. |
| `POST /admin/invitations` | JSON `{"email":"lawyer@example.com","role":"lawyer"}`; 201 `InvitationResponse` with ID, email, role, status, expiry, creation time and optional `magic_link`. | Create invitation modal. Show pending state and validation errors; display any returned magic link only to the authorized issuer/admin and do not log or persist it. |
| `DELETE /admin/invitations/{invitation_id}` | No body; 204 empty response. | Revoke confirmation in invitations management. Current frontend reloads after success; use the existing page flow and update its list only once backend confirms. Handle 204 without JSON parsing. |
| `GET /admin/audit-logs` | Not present in the saved OpenAPI operation list; frontend expects `{ logs, total }` with audit-log rows. | `/portal/audit-logs` (issuer side; legacy `/admin/audit-logs` redirects). A failed `adminFetch` is currently converted into empty logs. Make failure visible and confirm exact backend filters/fields before wiring. |

### Frontend-contract operations without an active screen caller

These operations appear in `openapi-updated.json` but were not found as active frontend calls during this review:

| Endpoint | Guidance |
| --- | --- |
| `GET /users/search?email=…` | Contract-only lookup returning `UserSearchResponse`. Do not build around it until a screen needs it and backend registration is verified. Participant addition currently posts an email directly. |
| `POST /documents/{document_id}/search` | Contract-only semantic search within one document. The active search screen calls global `POST /search`; do not substitute the document search route without a product decision. |

Frontend Next handlers/helpers also contain inactive or uncontracted endpoints:

| Frontend receiver/helper | Backend target | Status |
| --- | --- | --- |
| `src/app/api/portal/blockchain/record/[id]/route.ts` | `POST /blockchain/record/{id}` | No active caller found; target is absent from the local backend. The saved contract says finalize is the sole on-chain hashing point. |
| `listDemoSnapshots` / `restoreDemoSnapshot` in `src/features/documents/document-lifecycle-api.ts` | `GET /documents/{id}/snapshots`; `POST /documents/{id}/snapshots/{snapshot}/restore` | Helpers have tests but no current screen caller; paths are absent from the local backend and saved OpenAPI. Do not confuse them with active `POST /documents/{id}/restore`. |

## Screen-by-screen integration behavior

Keep the current routes, layout, component hierarchy and visual language. The following describes what each screen should expect from its API flow, including states that must remain distinct.

| Screen | Data/action flow | Expected UI states and behavior |
| --- | --- | --- |
| **Register and verify email** (`/register`) | Submit `POST /auth/signup`; optional resend uses `POST /auth/resend-verification`. | Validate required names/email/password in the form; disable duplicate submit; show account-created/verification-required state from `requires_email_confirmation`; retain inputs on failure. Do not imply phone or invitation role was stored until backend accepts those fields. Resend success is a neutral message, not proof of delivery. |
| **Sign in and sign out** (`/login`, portal shell) | `POST /auth/signin`, then token cookies; sign out should call backend `POST /auth/logout` and clear cookies. | Show invalid credentials vs temporary service failure; never put JWTs in browser storage or page data. Backend role is exact `user`/`lawyer`; frontend aliases are cosmetic only. Clear local cookies even if logout cannot reach the backend. No refresh endpoint is implemented in this checkout. |
| **Portal shell/profile** (`/portal/*`, `/portal/profile`) | `GET /users/`; shell also loads document summary/notifications. | Keep shell loading distinct from profile failure. Do not infer a role from missing profile data. Show a recoverable error rather than a blank dashboard or permission grant. |
| **Books** (`/portal/books`) | List, create, detail and delete book routes; close route is available only in backend. | Empty state after successful `[]`; form validation for number/year; 400 duplicate conflicts inline; 409 delete conflict should explain that a book with filed documents cannot be deleted. Current UI expects old count fields and must reconcile before displaying capacity. |
| **Upload** (`/portal/upload`) | Load profile and books, then send PDF to `POST /documents/upload`. | Keep file/title/book selected when upload fails; show which register is available; preserve multipart boundary; show accepted (202) separately from processing success. Use returned document ID for processing route. Do not show a false “uploaded” success for a proxy/network failure. |
| **Library/dashboard** (`/portal/documents`, `/portal/dashboard`) | Load `GET /documents/`; dashboard may also call `/admin/dashboard`. | Skeleton/loading; genuine empty state with upload link; retryable service error; list rows from the current backend response. Backend document list is absent locally. Demo mode and mock fixtures are not live API evidence. |
| **Upload processing** (`/portal/upload/processing`) | Poll/read `GET /documents/{id}` for lifecycle/status. | Keep processing, completed, failed and unknown states distinct. Stop/retry polling according to agreed backend status semantics; provide return/retry action on terminal failure. No document-processing backend exists in this local checkout. |
| **Document detail/version** (`/portal/documents/[id]`) | `GET` detail + versions; rename, upload new version, finalize. | Render only actions allowed by backend `permissions`; loading/not found/forbidden/network error are different. Confirm finalization. After new version acceptance use its returned ID and refresh detail/list/history; the current page discards it and leaves caches stale. |
| **Extraction review** (`/portal/documents/[id]/review`) | Load extraction, patch edits, optionally analyze, then approve. | Align OCR blocks/flags to PDF pages; keep raw OCR separate from edited text; preserve edits on failure; handle 404 as “not ready” only if backend defines that case; handle 409 by refreshing; show approval as a separate freeze step. These endpoints are absent locally. |
| **Integrity verification** (`/portal/documents/[id]/verify`) | Run `GET /verify`; after human review, optionally call `POST /restore`. | Show verdict from backend. `VERIFICATION_UNAVAILABLE` is not tampering; `SNAPSHOT_COMPROMISED` means no trusted comparison baseline; `NOT_ANCHORED` means there is no chain anchor. Only offer restore for a state the backend authorizes, with explicit confirmation and pending feedback. |
| **Participants/activity** (`/portal/documents/[id]/participants`, `/activity`) | Load parties/audit logs; add/revoke participant. | Pending invitation must not look like granted access. Require confirmation for revoke, preserve invite form on failure, and keep audit failure separate from empty history. Backend routes are absent locally. |
| **Invitations** (`/portal/invitations`) | List own pending invitations; accept/decline. | Clearly show invitation status; pending access is not document access. On acceptance refresh invitation and document list; on decline remove access eligibility. Do not silently treat action errors as completion. |
| **Access requests** (`/portal/requests`, `/portal/requests/my`) | Issuer list/filter/review; user sees own request statuses. | Separate loading/error/empty; require rejection reason as current UI does; disable only the row being reviewed; preserve reason on failure; show approved/rejected state after backend confirmation. Contract is currently frontend-only. |
| **Search/Q&A** (`/portal/search`, document ask/chatbot) | Search with `POST /search`; ask with `POST /documents/{id}/ask`. | Keep query/question visible; show loading, no results, error, and results separately. Link results to the correct document/version and evidence snippet. Agree a canonical Q&A response and citations before relying on answers. |
| **Notifications** (`/portal/notifications`, shell badge) | List/count, mark one read, mark all read. | Keep loading separate from empty and error. Disable read actions while pending; update list and badge together only after success. Current notification page ignores query errors and can look empty on failure. |
| **Admin users/invitations/audit** (`/portal/users`, `/portal/issuer-invitations`, `/portal/audit-logs`) | Current calls use `/admin/users`, `/admin/invitations`, and `/admin/audit-logs`; dashboard uses `/admin/dashboard`. Legacy `/admin/*` management URLs redirect into portal routes. Other admin pages use demo fixtures/local state. | Do not mix demo rows with live rows without a visible data mode. Server fetch failures currently become empty collections on some pages; present an error/retry or unauthorized state instead. Keep admin navigation and screens unchanged while contracts are wired. |

### Current UI behavior and concrete integration traps

These findings come from active frontend source. They describe behaviors worth preserving and places where current UI can misrepresent an API failure or fail to reflect a successful mutation.

| Current behavior | Evidence and integration consequence |
| --- | --- |
| Login has pending text, inline error/toast and role-specific navigation. Registration validates fields, disables duplicate submits and displays an email-check state. | `src/features/auth/pages/login-page.tsx`, `register-page.tsx`, `src/features/access/portal-role.ts`. Preserve this flow while reconciling signup fields and exact backend role values. `/auth/verified` displays an “Email verified” page state without checking verification through an API (`src/app/auth/verified/verified-content.tsx`). |
| Portal shell maps failed profile data to `null`, failed documents to `[]`, failed unread count to `0`, and failed notifications to `[]`. | `src/features/portal/portal-layout.tsx`. Profile has an unavailable state; document/notification failures may look like no activity. Keep request errors separate from successful empty values. |
| Dashboard has profile skeleton, document error/retry, recent-document empty state, and attention/processing groups. Admin metric failure can fall back to document-derived metrics without a visible admin-error state. | `src/features/portal/pages/dashboard-page.tsx`. Do not silently replace a failed admin count with a metric of different meaning. The `total_processed` metric is labeled “Processing”; confirm its definition with the backend owner. |
| Document library distinguishes skeleton, error/retry, empty repository and filtered-empty results. | `src/features/documents/pages/documents-page.tsx`. Preserve this distinction when `/documents/` is wired. |
| Upload is lawyer-gated; validates file/title/book; prevents duplicate submission; preserves selected values on failure; success shows returned ID/status/message. | `src/features/documents/pages/upload-page.tsx`. Treat `202` as accepted, not processing-complete, and use the backend-returned ID for the processing screen. |
| Processing polls document detail every two seconds until review-ready/completed/failed. A missing ID fails; lookup errors expose Retry; terminal states link to review/detail/upload. | `src/features/documents/pages/upload-processing-page.tsx`. Agree backend status strings and a safe retry/backoff policy before relying on this poller. The local backend has no document status route. |
| Review gates on role/access/loading/error; extraction 404 links back to processing/document; 409 refreshes the extraction and tells the user the state changed. Corrections survive save failure; save/analyze/approve controls disable while pending; approval is confirmed. | `src/features/documents/pages/documents-id-review-page.tsx`, `src/features/documents/components/review-workspace.tsx`. Preserve unsaved text on all errors and keep 404 semantics aligned with backend readiness behavior. |
| Document detail shows a skeleton, then labels every detail-query failure “Document not found.” It supports rename, new-version upload, finalize confirmation, download and workspace tabs. | `src/features/documents/pages/documents-id-page.tsx`, `src/features/documents/components/document-workspace.tsx`. Separate 404 from 401/403/5xx; an outage must not claim the document is missing. |
| Version/finalize invalidation updates detail/chain/audit keys but omits versions, library and shell document counts. Rename only refetches detail; upload acceptance does not refresh list/book consumers. Activity has a different detail key (`portal-document`) than the main detail page (`portal-doc`). | `src/features/documents/pages/documents-id-page.tsx`, `src/features/documents/components/document-workspace.tsx`, `src/features/documents/pages/documents-id-activity-page.tsx`, `src/features/documents/pages/upload-page.tsx`. Once mutations are live, refresh every visible consumer from a consistent query-key plan; current UI can remain stale after backend success. |
| Verify has loading/error/retry; restore is offered for mismatch and refetches verification only. Repository verification is a separate `/portal/verification` page. | `src/features/documents/pages/documents-id-verify-page.tsx`, `src/features/verification/pages/verification-page.tsx`. Do not conflate the repository ID flow with PDF upload or document-specific verification. Restore should refresh detail/activity as well once implemented. |
| Participant page gates by lawyer/capability and refreshes parties after mutation, but the initial parties request has no dedicated loading indicator and may briefly look empty. Activity has loading/error/filter-empty states. | `src/features/documents/pages/documents-id-participants-page.tsx`, `documents-id-activity-page.tsx`. Show pending load distinctly from zero participants. |
| Invitations have participant gate, loading/query/action errors, empty state and per-invitation pending state. Accept invalidates invitations and opens the document. | `src/features/access/pages/invitations-page.tsx`. After acceptance also refresh the document library/shell list. |
| Request pages have role gates, status filters, loading/error/empty states, required rejection reason and per-row pending state. | `src/features/access/pages/requests-page.tsx`, `requests-my-page.tsx`. Confirm backend status names and stale/unauthorized decision errors. |
| Full search shows loading/error/no-results/results. Shell search debounces and supports keyboard selection but converts request failure into no hits. The UI prints optional `result.text`, while saved `GlobalSearchHit` has chunk/document IDs, chunk index and score but no snippet. | `src/features/documents/pages/search-page.tsx`, `src/features/portal/components/portal-search-bar.tsx`, `src/features/access/portal-compat-types.ts`, `src/shared/types/generated/schema.ts`. Add a snippet to the agreed contract or render absent snippets gracefully; keep search outage distinct from no matches. |
| Ask/chat prevents duplicate sends and appends a friendly error message. It accepts `answer`, `response`, `message`, or serialized JSON as response fallback. | `src/features/documents/pages/documents-id-ask-page.tsx`, `src/features/portal/components/portal-chatbot.tsx`. This is compatibility parsing, not a stable wire contract; settle on one response schema and citation/source format. |
| Notifications show skeleton and empty state, but list/mutation errors are not rendered. Page actions invalidate only `portal-notifications`; shell badge/dropdown use `portal-notif-count` and `portal-shell-notifications`. Shell mark-all ignores HTTP status. | `src/features/portal/pages/notifications-page.tsx`, `src/features/portal/portal-layout.tsx`. Surface errors and synchronize all views after read changes. |
| Books screen has role gate, loading/error/retry/empty, form validation/pending, create invalidation and delete confirmation. Current delete text says the book and its documents will be permanently deleted. | `src/features/office/pages/books-page.tsx`. That confirmation conflicts with the local backend, which refuses deletion with 409 when any document exists and does not cascade. Update the copy to match the agreed backend policy before connecting. |
| Admin server pages may turn fetch failures into empty data. Invitation create/revoke show pending/error/success then reload. | `src/features/office/pages/users-page.tsx`, `src/features/access/pages/issuer-invitations-page.tsx`, `src/features/office/pages/audit-logs-page.tsx`, `src/features/admin/invitations-permissions/`. Do not render a backend failure as “no users/invitations/logs.” |
| Profile page does not show profile-fetch errors; security can show a failed request as MFA “Not enabled”; category/settings profile failure can look like a lawyer restriction. | `src/features/account/pages/profile-page.tsx`, `profile-security-page.tsx`, `src/features/office/pages/categories-page.tsx`, `office-settings-page.tsx`. Distinguish unavailable profile from actual role/MFA values. |

The following pages/features are local, demo-only or placeholders and should not be counted as backend coverage: password reset (`/forgot-password`, `/reset-password`), categories, office settings, generated reports, most admin analytics/processing/blockchain/category screens, and the document viewer placeholder. `/portal/reports` reads documents but generates/downloads reports locally. Confirm a page's actual data owner before turning its demo behavior into an API promise.

## Example payloads for future integration

Examples below are illustrative. The auth/book examples match source schemas in the local backend. Document/access/notification/admin examples match the frontend contract and must be validated against the backend version selected for integration.

### Upload and accepted response (frontend contract only)

```http
POST /documents/upload?book_id=<book-uuid>&file_name=deed.pdf
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=<generated-by-client>

file=<PDF bytes>
```

```json
{
  "document_id": "<document-uuid>",
  "status": "<backend-processing-status>",
  "message": "<accepted-for-processing message>"
}
```

The body example is the `DocumentUploadAcceptedResponse` shape, not an implemented route in the inspected backend. The frontend should treat 202 as acceptance only and use the returned ID to load processing/detail state.

### Extraction review (frontend contract only)

```json
{
  "document_id": "<document-uuid>",
  "extraction_id": "<extraction-uuid>",
  "status": "<processing-status>",
  "file_name": "deed.pdf",
  "storage_url": "<authorized-PDF-url>",
  "engine": "<OCR-engine>",
  "page_count": 1,
  "confidence_avg": 0.97,
  "blocks": [
    {
      "index": 12,
      "editable": true,
      "type": "paragraph",
      "text": "Current extracted text",
      "original_text": "Raw OCR text",
      "bbox": [0.1, 0.2, 0.8, 0.3],
      "page_idx": 0,
      "edited": false
    }
  ],
  "flags": [
    {
      "block_index": 12,
      "kind": "<flag-kind>",
      "severity": "<severity>",
      "message": "<review explanation>",
      "excerpt": "<text excerpt>"
    }
  ],
  "flag_count": 1,
  "high_severity_count": 0,
  "edited_block_count": 0,
  "is_reviewed": false,
  "reviewed_by": null,
  "reviewed_at": null
}
```

Save corrections with `PATCH /documents/{id}/extraction` and an `edits` array. Approval is a separate action; it freezes reviewed text and returns the content hash used later by finalize according to the saved contract.

### Request review (frontend-only request type)

```http
PATCH /requests/<request-uuid>/review
Content-Type: application/json

{"action":"reject","rejection_reason":"Please provide the required authorization."}
```

The current frontend ignores the response body. Before implementation, specify a canonical success response containing at least the request ID and its new status, plus the error cases for already-reviewed/not-owned requests.

### Integrity verification statuses (frontend contract only)

```json
{
  "document_id": "<document-uuid>",
  "status": "TAMPERED",
  "is_authentic": false,
  "baseline_trusted": true,
  "verified_at": "<ISO-8601 datetime>",
  "message": "<server verdict>",
  "tamper_report": {
    "total_changes": 2,
    "critical_changes": 1,
    "similarity": 0.94,
    "localized": true,
    "segments": ["<changed text segments>"],
    "replaced": 1,
    "inserted": 1,
    "deleted": 0
  }
}
```

The backend must compute the verdict. UI must not reduce every non-authentic or missing result to “tampered.”

## Contract mismatches and implementation blockers

| Priority | Finding | Frontend impact / decision needed |
| --- | --- | --- |
| Blocker | Local backend registers only accounts/books. `features/documents/service.py` is empty; there is no documents router/repository/storage/OCR/LLM/notifications/search/requests/admin implementation. | Do not treat the frontend's document workflow screens or schemas as live against this checkout. Confirm which API branch/version is intended or implement those backend routes first. |
| Blocker | Backend document files include models/schemas but migration metadata imports only `User` and `Book`; no migration revisions were found. ORM relationships refer to missing reverse relationships. | Document tables and relationships are not proven deployable. Backend owner should reconcile models and migrations before frontend integration. |
| High | The unregistered Python document schemas also differ from the frontend snapshot: backend list schema includes filing/access fields such as `book_id`, `doc_no`, `page_no`; backend detail adds draft/signed-copy concepts and different permission fields. The frontend snapshot instead expects list version/lifecycle data and detail hashes, summary, labels/entities/risk flags. | Do not treat the existence of Python models/schemas as a compatible API. Backend must publish one payload contract for list/detail and explain the mapping of list `id` to detail `document_id` before frontend work. |
| High | Book response mismatch. Local backend returns `status`, `closed_at`, `entry_count`, `last_doc_no`, `last_page_no`; frontend OpenAPI expects `document_count`, `page_count`, `is_full`. | Agree a single schema. Do not silently map page/entry counts to document/page counts without backend definitions. Current book list queries also reference missing `Document.is_latest`, a predicted source-level failure not runtime-tested. |
| High | Book close exists in backend but is absent from frontend OpenAPI/UI. Backend delete refuses nonempty books with 409, unlike the older OpenAPI description that says cascade delete. | Add a close control only after deciding UX and closed-book filing policy. Preserve delete conflict semantics; never tell the user documents will be cascade-deleted. |
| High | Signup frontend sends `phone_number` and optional invitation `token`; local backend accepts only email/password/names. | Backend must explicitly accept/persist phone and consume/validate invitation token, or frontend must stop presenting those values as successful integration. |
| High | Role contract differs. Frontend maps legacy roles (`admin`, `super_admin`, `document_issuer`) to lawyer UI; local database roles are `user`/`lawyer`, and backend requires exact `lawyer`. | Treat backend 403 as authoritative. Do not use client aliases to bypass authorization. Reconcile role migration/provisioning outside UI. |
| High | Local backend logout exists but frontend logout only clears cookies. No refresh route exists. | Call logout best-effort, always clear local tokens, and define reauthentication behavior after access-token expiration. |
| High | Document lifecycle sources disagree. Frontend generated contract uses `DRAFT | FINALIZED | ARCHIVED`; backend document schema lists `PREPARING | READY_FOR_SIGNATURE | SIGNED | FINALIZED | CANCELLED`, while model/constants use `DRAFT | FINALIZED | ARCHIVED`. | Backend owner must publish one state machine and transition table before frontend buttons or labels depend on lifecycle strings. |
| Medium | Frontend 422 type expects a `detail` shape; backend emits `message` and `details.errors`. | Update boundary parsing when the API version is confirmed; preserve structured field errors and safe fallback text. |
| Medium | OpenAPI type-generation script targets legacy `src/lib/types/generated/schema.ts`; active imports use `src/shared/types/generated/schema.ts`. | Correct the generator destination during contract-maintenance work, then regenerate only after reviewing the backend contract diff. Do not hand-edit generated output. |
| Medium | Some admin server loaders convert fetch failures into empty arrays. Notifications and several direct callers also reduce failures to generic strings or omit visible query-error UI. | Separate “no records” from “could not load”; show retry and authorization states so a missing route is not misdiagnosed as empty data. |
| Medium | User provisioning/signin sync has source-level risks: missing local accounts may not have required names; signup compensation does not cover a later transaction commit failure. | Backend owner should resolve before relying on account creation or migration of existing Supabase users. These are source findings, not reproduced runtime failures. |
| Medium | Backend rate limiting uses IP and process-local counters. A proxy deployment may make many users share the same backend IP. | Confirm forwarded-client IP configuration and production limit behavior before load or multi-instance deployment. |

Other source limitations: backend README is empty; no backend tests were found; runtime database schema and Supabase/JWKS/storage/blockchain configuration were not exercised. These omissions limit certainty but do not establish that a separately deployed API is unavailable.

## Safe integration order

1. **Select the authoritative backend revision.** Confirm the base URL, deployed branch/version and its OpenAPI document. Keep the nested ignored checkout as local inspection material, not an accidental frontend dependency.
2. **Reconcile the existing live surface.** Match signup/signin/resend and books request/response/error contracts. Resolve role naming, signup invitation fields, logout, book fields, close/delete policy and book query/model issues.
3. **Define one document contract and lifecycle.** Publish endpoint methods, auth/ownership rules, body encoding, response schemas, error/status transitions, upload acceptance semantics, file/storage behavior, immutable finalization and verification/restore behavior. Ensure migrations include the models.
4. **Refresh contract artifacts.** Update `openapi-updated.json` from the chosen backend, review the diff, fix type generation to write to the consumed schema location, and regenerate types. Generated types alone do not validate API responses at runtime.
5. **Integrate one screen flow at a time.** Recommended order: auth/profile → books/upload → processing/library/detail → extraction/review/approve → finalize/verify → parties/invitations/requests → search/Q&A/notifications → live admin. Keep current route/layout components and use the state table above as acceptance criteria.
6. **Verify with the real backend.** Confirm auth roles and cookies, 401/403/404/409/422/429 behavior, multipart upload and retry, 202 processing transition, 204 mutation handling, server cache behavior, ownership boundaries, document-version refresh, chain outage versus tampering, and PWA non-caching of private data. A static typecheck or mock-mode success is not backend verification.

## Source map

- **Frontend architecture:** `README.md`, `docs/ARCHITECTURE.md`, `src/server/api/backend.ts`, `src/shared/api/client.ts`, `src/app/api/portal/`, `src/app/api/admin/`.
- **Frontend contract:** `openapi-updated.json`, `src/shared/types/generated/schema.ts`, `src/shared/types/index.ts`, `package.json`.
- **Auth screens/callers:** `src/features/auth/pages/`, `src/app/api/auth/route.ts`, `src/app/api/portal/signup/route.ts`, `src/app/api/portal/resend-verification/route.ts`, `src/app/api/portal/logout/route.ts`.
- **Documents/verification:** `src/features/documents/`, `src/features/verification/`.
- **Access/requests:** `src/features/access/`, `src/features/documents/pages/documents-id-participants-page.tsx`.
- **Books/admin/notifications:** `src/features/office/`, `src/features/admin/`, `src/features/portal/pages/notifications-page.tsx`.
- **Nested backend:** `lexchain_backend/backend/src/app/main.py`, `features/accounts/`, `features/books/`, `features/documents/`, `infrastructure/`.
