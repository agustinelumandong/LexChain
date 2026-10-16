# Session recovery and backend errors

**Status:** Design approved in chat; awaiting spec review.

**Issue:** [#120 Recover rejected sessions and display useful backend errors](https://github.com/agustinelumandong/LexChain/issues/120)

## Goal

When a backend rejects the current portal token, end that frontend session and return the user to sign-in. For recoverable request failures, show the backend's message and field errors without losing entered data. Preserve access-denied and not-found behavior.

## Current behavior

- The `/api/portal/proxy` and `/api/portal/proxy-post` routes forward upstream response statuses and JSON bodies. They do not clear the frontend cookies or navigate the browser after an upstream `401`.
- `src/proxy.ts` uses the presence of `portal_token` to decide whether portal pages require sign-in. A rejected token remains present until `/api/portal/logout` clears it.
- Most frontend request helpers call `fetch` directly. Several replace the backend message with generic text or throw an error without preserving its HTTP status.
- `UploadRequestError` already reads the #116 error envelope, including `message`, `details.reason`, related documents, and `details.errors`.
- The participant and document-activity route handlers call `/users/` to check the profile role. They currently translate an unavailable/non-lawyer profile into `403`, including when `/users/` returned `401`.

## Design

### Shared frontend request and error handling

Add a small shared portal request helper used by the existing in-scope document, draft, access, notification, and review request helpers. It will keep each request's method, body, headers, encoded path, and same-origin credentials intact. On a `401`, it will use the existing `/api/portal/logout` route to clear the session cookies, then replace the current location with `/login`. Concurrent unauthorized responses share one cleanup/navigation operation. The response remains a `401` to callers; token refresh is out of scope.

Add a shared status-bearing portal error representation for unsuccessful responses. It will prefer the backend `message`, then a supported legacy `detail`, and use a safe status-based fallback for malformed or empty bodies. It will retain `details.reason`, `details.errors`, and other details for feature-specific handling. Extract the common envelope parsing from `UploadRequestError`; keep upload-specific fields such as related documents and duplicate-document navigation in the upload error type. Adapt existing in-scope request helpers to this shared behavior rather than changing backend routes or request semantics wholesale.

### Authentication and authorization distinction

The participant and document-activity route handlers will pass an upstream `/users/` `401` through as `401` before evaluating the profile role. A successful profile response for a role without lawyer access remains `403`. Existing `403` and `404` statuses from document endpoints remain unchanged and do not trigger sign-in recovery.

### Error presentation and input preservation

Recoverable failures display the backend message. `details.errors` are associated with an editable field when the backend identifies a field that exists in the current form; unmatched or malformed entries remain readable in the form-level error summary. Failed requests do not reset entered values. The upload flow continues to use its #116 recovery choices and specialized document details.

## Test seams

- **Route seam:** tests for participant and activity profile checks prove upstream `401` stays `401`, role denial stays `403`, and document `403`/`404` responses are preserved.
- **Request seam:** tests prove unauthorized requests invoke logout and navigation once even when multiple requests fail, while ordinary `403` and `404` responses do not.
- **Screen seam:** focused tests prove backend messages and available field errors render while entered values remain.
- **Browser seam:** a deterministic browser flow starts with a present but backend-rejected cookie, observes one sign-in navigation, and confirms validation errors plus `403`/`404` do not cause a redirect loop.

All backend calls in the deterministic browser test are stubbed. It verifies frontend behavior, not deployed authentication or authorization.

## Scope boundaries

- No token refresh, backend changes, new permission rules, or changes to authentication request payloads.
- No conversion of `403` or `404` into session expiration.
- No changes to HTTP methods, request bodies, multipart encoding, query semantics, or same-origin cookie/server bearer transport.
- No broad rewrite of unrelated admin, signup, or account-authentication requests.
- Preserve feature-specific error behavior from #116 and existing document, draft, access, notification, and review flows.
