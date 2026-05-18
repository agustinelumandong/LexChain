# LexChain Frontend — API Integration TODO

> Generated from openapi.json audit — 2025-05-09
> Status: Near Complete

---

## 🔴 Critical (Must Fix Before Deploy)

### 1. Backend: Define `AskResponse` schema for `/documents/{id}/ask`

**Status:** ✅ Done — Backend confirmed the shape:
```json
{
  "question": "string",
  "answer": "string",
  "model": "llama-3.1-8b-instant",
  "citations": [{ "chunk_id": "uuid", "chunk_index": 0, "score": 0.299 }]
}
```
`AskCitation` = `{ chunk_id, chunk_index, score }` — no `text` field.

---

### 2. Frontend: Implement `askDocument()` API function

**Location:** `src/services/api/documents.api.ts` + `app/document/[id].tsx`

**Status:** ✅ Done — implemented proactively
- `AskResponse` + `AskSource` types defined
- `documentsApi.ask()` function added
- `useAskDocument()` hook in `use-documents.ts`
- `AskDocumentCard` component added to document detail screen

---

## 🟡 Medium (Should Fix)

### 3. Frontend: Implement `searchDocument()` for per-doc search

**Status:** ✅ Done
- `searchDocument()` API function implemented
- `useSearchDocument()` hook implemented
- `DocumentSearchBar` + `SearchResultsCard` UI on document detail screen

---

### 4. Global search `text` field

**Status:** ✅ Done — Backend includes `text` field in `GlobalSearchHit`:
```json
{
  "chunk_id": "uuid",
  "document_id": "uuid",
  "chunk_index": 0,
  "score": 0.136,
  "text": "Text excerpt of the matched chunk."
}
```
Both `docs/openapi.json` and `frontend/openapi.json` schemas confirm this. `GlobalSearchHit` type updated, mock data updated. `fetchSearchResultsWithDetails()` remains but is no longer needed for text — kept for document detail enrichment.

---

## 🟢 Low (Nice to Have)

### 5. Wire `limit`/`offset` pagination params to frontend

**Status:** ✅ Done — params wired to API + hook. UI controls not yet built.

---

### 6. Define `SupabaseUser` schema for SignInResponse.user

**Status:** ✅ Done — `SupabaseUser` type defined in `auth.types.ts`. Backend should update openapi.json to match.

---

## ✅ Completed

- [x] Upload endpoint uses query param `file_name` (correct — spec path param was a bug)
- [x] Rename PATCH `/documents/{document_id}/` with trailing slash (correct)
- [x] Global search `/search` endpoint implemented
- [x] Global search `text` field confirmed in backend schema — `GlobalSearchHit` type updated (2025-05-10)
- [x] SignUp/SignIn/ResendVerification auth endpoints match frontend
- [x] Per-doc search `searchDocument()` API + `useSearchDocument()` hook implemented (2025-05-09)
- [x] Pagination params wired to `useDocuments()` (2025-05-09)
- [x] Barrel exports fixed — `SearchHit`, `SearchResponse`, `RenameDocument*` now exported (2025-05-09)
- [x] `SupabaseUser` type defined + `SignInResponse` updated (2025-05-09)
- [x] Per-doc search UI added to document detail screen — `DocumentSearchBar` + `SearchResultsCard` (2025-05-09)
- [x] Q&A `askDocument()` API + `useAskDocument()` hook implemented (2025-05-09)
- [x] Q&A UI added — `AskDocumentCard` on document detail screen with answer + sources display (2025-05-09)

---

## Summary Board

| #  | Task                              | Owner  | Status      |
| -- | --------------------------------- | ------ | ----------- |
| 1  | Backend: define AskResponse       | Backend | ✅ Done     |
| 2  | Frontend: implement askDocument   | Frontend | ✅ Done     |
| 3  | Per-doc search                    | Frontend | ✅ Done     |
| 4  | Global search text field          | Frontend | ✅ Done     |
| 5  | Wire pagination                   | Frontend | ✅ Done     |
| 6  | SupabaseUser schema               | Frontend | ✅ Done     |

**Legend:**
- ⬜ Open = not started
- 🔄 In Progress = backend action needed
- ✅ Done = completed
- 🚫 Blocked = waiting on external dependency

---

## Remaining backend actions:

1. Update `docs/openapi.json` with the confirmed `AskResponse` schema shape (`question`, `answer`, `model`, `citations[]`)
2. (none remaining)