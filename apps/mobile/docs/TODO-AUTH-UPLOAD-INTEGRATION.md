# TODO: Auth, Document Upload, List, Detail, and Search API Integration

Focus scope:

- Auth only
- Document upload only
- Document list and detail
- Global document search
- No whitelist API yet
- No document chat/ask flow yet
- No dashboard real-data pass yet

## Implementation Status

- [x] API client added.
- [x] Auth API module added.
- [x] Documents API module added.
- [x] React Query hooks added.
- [x] Sign in wired to `POST /auth/signin`.
- [x] Sign up wired to `POST /auth/signup`.
- [x] Upload wired to `POST /documents/upload`.
- [x] Documents tab wired to `GET /documents/`.
- [x] Document detail wired to `GET /documents/{document_id}`.
- [x] Global search wired to `POST /search`.
- [ ] Resend verification UI action.
- [ ] Refresh-token renewal flow.
- [ ] Real backend device test.

## Backend Contract

Use `frontend/docs/openapi.json` as the source of truth.

Current relevant endpoints:

- `POST /auth/signin`
- `POST /auth/signup`
- `POST /auth/resend-verification`
- `POST /documents/upload`
- `GET /documents/`
- `GET /documents/{document_id}`
- `POST /search`

Important note:

- Older docs may mention `/auth/login`, `/auth/register`, or `/api/v1`.
- Current OpenAPI does not show those paths.
- Follow `openapi.json` unless backend confirms otherwise.

## MVP Flow

Target first working flow:

1. User signs up.
2. User verifies email if backend requires it.
3. User signs in.
4. App stores auth token.
5. User uploads one document file.
6. Backend returns `document_id`, `status`, and `message`.
7. App routes to processing or document result screen.
8. Documents tab loads real document list.
9. Document detail screen loads one real document by ID.
10. Search box can call backend global search.

## Step 1: Create API Service Layer

Create:

```txt
frontend/src/services/api/client.ts
frontend/src/services/api/auth.api.ts
frontend/src/services/api/documents.api.ts
frontend/src/services/api/index.ts
frontend/src/services/query/keys.ts
frontend/src/services/query/use-auth.ts
frontend/src/services/query/use-documents.ts
frontend/src/services/query/index.ts
```

Use existing helpers:

- `frontend/src/shared/config/env.ts`
- `frontend/src/shared/utils/secure-storage.ts`
- `frontend/src/shared/utils/api-error.ts`
- `frontend/src/shared/providers/query-client.ts`

## Step 2: API Client

Client requirements:

- Read base URL from `EXPO_PUBLIC_API_URL`.
- Attach `Authorization: Bearer <access_token>` when auth is required.
- Support JSON requests.
- Support multipart form upload.
- Parse backend errors through existing error utilities.

## Step 3: Sign In

Wire:

```txt
frontend/app/(auth)/sign-in.tsx
```

Use:

```http
POST /auth/signin
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Expected success response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {}
}
```

TODO:

- Replace fake success toast.
- Call real sign-in mutation.
- Save `access_token` with `authTokenStorage`.
- Add storage support for `refresh_token` if needed.
- Cache `user` through React Query.
- Route to `/(tabs)` only after successful backend response.
- Show backend error for invalid credentials or unverified email.

## Step 4: Sign Up

Wire:

```txt
frontend/app/(auth)/sign-up.tsx
```

Use:

```http
POST /auth/signup
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "password",
  "f_name": "First",
  "l_name": "Last",
  "phone_number": "optional phone"
}
```

Expected success response:

```json
{
  "message": "...",
  "user_id": "...",
  "email": "user@example.com",
  "requires_email_confirmation": true
}
```

TODO:

- Map frontend first name and last name fields to `f_name` and `l_name`.
- Send `phone_number`; use `null` or empty value only if backend accepts it.
- If `requires_email_confirmation` is true, show verify-email message.
- Route user to sign-in after signup success.
- Do not auto-login unless backend returns auth tokens.

## Step 5: Resend Verification

Use later if sign-in returns unverified-email state:

```http
POST /auth/resend-verification
```

TODO:

- Add a small action on sign-in or signup success message.
- Send email payload based on OpenAPI schema.
- Show success/error toast.

## Step 6: Upload Document

Wire:

```txt
frontend/app/upload.tsx
```

Use:

```http
POST /documents/upload
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

OpenAPI upload body accepts:

```txt
file
```

Expected success response:

```json
{
  "document_id": "...",
  "status": "...",
  "message": "..."
}
```

TODO:

- Keep existing document picker UI.
- On `Upload document`, require at least one selected file.
- Upload first selected file first.
- Create `FormData`.
- Append file as `file`.
- Include file URI, name, and MIME type.
- Send auth token.
- On `202`, show backend message.
- Route to processing or document detail using `document_id`.
- Show backend error for empty file, unsupported type, too large, or unauthenticated.

Important note:

- Current upload UI has document type and whitelist fields.
- Current OpenAPI upload body only accepts `file`.
- Do not send document type or whitelist yet unless backend adds them.

## Step 7: List Documents

Wire:

```txt
frontend/app/(tabs)/documents.tsx
frontend/src/services/api/documents.api.ts
frontend/src/services/query/use-documents.ts
```

Use:

```http
GET /documents/
Authorization: Bearer <access_token>
```

Expected success response:

```json
[
  {
    "id": "...",
    "file_name": "contract.pdf",
    "content_type": "application/pdf",
    "status": "processing",
    "created_at": "2026-05-07T00:00:00Z"
  }
]
```

TODO:

- Replace mock document list source with backend list query.
- Keep existing search/filter UI local first if backend fields are limited.
- Map backend `id` to frontend document route ID.
- Map `file_name` to displayed title.
- Map `created_at` to displayed date.
- Show loading skeleton while query runs.
- Show empty state when backend returns `[]`.
- Show unauthenticated error by routing to sign-in or showing auth toast.
- Invalidate this query after successful upload.

## Step 8: Get Document Detail

Wire:

```txt
frontend/app/document/[id].tsx
frontend/src/services/api/documents.api.ts
frontend/src/services/query/use-documents.ts
```

Use:

```http
GET /documents/{document_id}
Authorization: Bearer <access_token>
```

Expected success response:

```json
{
  "document_id": "...",
  "file_name": "contract.pdf",
  "content_type": "application/pdf",
  "status": "completed",
  "summary": "...",
  "labels": ["contract"],
  "entities": [],
  "risk_flags": [],
  "created_at": "2026-05-07T00:00:00Z"
}
```

TODO:

- Fetch detail by route param `id`.
- Show loading state before data arrives.
- Show not-found state for `404`.
- Map `summary` to existing summary card.
- Map `labels` to document type/status chips if useful.
- Map `entities` and `risk_flags` to simple sections first.
- Keep verification/whitelist UI disabled or mock until backend supports it.

## Step 9: Global Search

Wire:

```txt
frontend/app/(tabs)/documents.tsx
frontend/src/services/api/documents.api.ts
frontend/src/services/query/use-documents.ts
```

Use:

```http
POST /search
```

Request body:

```json
{
  "query": "lease agreement"
}
```

Expected success response:

```json
{
  "query": "lease agreement",
  "results": [
    {
      "chunk_id": "...",
      "document_id": "...",
      "chunk_index": 0,
      "score": 0.95,
      "text": "Matched document text..."
    }
  ]
}
```

TODO:

- Use backend search only when query is not empty.
- Debounce search input before calling API.
- Show search loading state separate from document-list loading.
- Map each result to a document result row.
- Use `document_id` for opening document detail.
- Show `text` as match snippet.
- Keep local list view when search query is empty.
- Clear backend search results when query is cleared.

Important note:

- OpenAPI does not show `401` for `POST /search`, but search may still need auth depending on backend rules.
- Test with token attached first.

## Step 10: Keep Out Of Scope For Now

Do not wire yet:

- `POST /documents/{document_id}/ask`
- `POST /documents/{document_id}/search`
- whitelist management
- dashboard counters
- document verification polish

## Done Criteria

Auth is done when:

- Invalid login shows backend error.
- Successful login stores token.
- App routes to tabs only after real success.
- Signup sends OpenAPI-correct field names.
- Email-verification requirement is visible to user.

Upload is done when:

- Upload requires signed-in user.
- Multipart file reaches backend.
- Backend returns `document_id`.
- App shows accepted/processing state.
- App does not send unsupported fields.

Documents list/detail is done when:

- Documents tab loads from `GET /documents/`.
- Upload success refreshes the list.
- Tapping a document opens real detail by `GET /documents/{document_id}`.
- Loading, empty, unauthenticated, and not-found states are handled.

Search is done when:

- Non-empty search calls `POST /search`.
- Empty search returns to normal document list.
- Results show matched snippet text.
- Tapping result opens the related document detail.
