# Frontend authentication and books integration spec

> Contract review update, 2026-10-08: this spec and GitHub #48 were authored against the earlier ignored backend reference. The updated live snapshot now has 57 operations and includes `/users/`. Current source already contains the role bootstrap and ordinary signup changes. Before implementing remaining work, use the current-review section of `BACKEND-FRONTEND-INTEGRATION-AUDIT.md`: revocation is `POST /auth/signout`, not `/auth/logout`; BookResponse uses OPEN/CLOSED and filing counters; CLOSED books support explicit physical-register filing. GitHub #49–54 were inspected but not edited by this audit. Historical assumptions below are retained for traceability and are not current implementation instructions where they conflict with the updated contract.

## Problem Statement

The frontend already has sign-in, registration, verification, portal, and register-book screens. It also has same-origin Next.js API adapters that forward requests to a separately hosted backend. The ignored backend checkout is available only as a temporary reference for the API contract; it is not part of the frontend app, build, or deployment.

The current frontend and that local backend contract differ in several places. The sign-in endpoint returns a role, but the portal shell and Books screen also require a profile endpoint that the local backend does not register. Registration sends an invitation token and phone field that the local signup contract does not accept as meaningful inputs. The frontend book type expects document/page counts and a full flag, while the backend returns an open/closed status, entry count, and last filing numbers. The backend also has logout and close-book operations that the frontend does not currently call.

Without a deliberate frontend-only integration, screens can fail before reaching an available endpoint, show misleading book data, report a successful invitation that the service did not accept, or leave upstream sign-out unrequested. The deployed backend has not been checked live, so the local source is evidence for this spec but not proof that production uses the same version.

## Solution

Connect the confirmed authentication and books operations through the existing frontend API boundary, one screen flow at a time. Adapt the frontend requests and responses to the local contract, preserve the current layout and navigation, and present backend states and errors accurately.

Use the role returned by sign-in to bootstrap role-dependent portal navigation and the Books screen when the profile endpoint is unavailable. Treat that role as a presentation hint only; the backend remains responsible for authorization. Keep backend source out of the frontend runtime and do not modify the backend repository.

Only the ordinary signup flow is included. Invitation-token signup remains explicitly unresolved until a connected backend contract confirms that it consumes the token. Other endpoint families remain outside this integration.

## User Stories

1. As a visitor, I want to sign in with my email and password through the existing frontend session flow, so that my credentials reach the external service without exposing the backend URL or token to browser code.
2. As a user with valid credentials, I want the frontend to establish a session from the returned access token and expiry, so that my session lifetime follows the backend response instead of a guessed duration.
3. As a lawyer account holder, I want the role returned by sign-in to open the lawyer portal and show the register-book feature, so that the frontend does not require an unsupported profile lookup just to identify my role.
4. As a user with a supported participant role, I want the frontend to keep the existing role-based landing behavior when the connected service returns that role, so that sign-in navigation stays consistent with the existing interface.
5. As a user with an unknown or absent role, I want the frontend to avoid showing lawyer-only controls, so that the interface does not imply access the backend has not granted.
6. As a user, I want invalid-credential, unverified-account, rate-limit, and service-unavailable results to appear as understandable sign-in feedback, so that I know whether to correct my input, wait, or retry.
7. As a registrant, I want the registration form to send the backend-supported email, password, first-name, and last-name fields, so that valid details are not mixed with unsupported API fields.
8. As a registrant, I want client-side name and password checks to match the confirmed signup constraints, so that the form does not reject values the backend accepts or accept values the backend must reject.
9. As a registrant, I want my form values to remain available after a backend validation or network error, so that I can correct the problem without re-entering everything.
10. As a registrant whose response requires email confirmation, I want the success screen to ask me to check my email, so that I do not mistake account creation for a verified or signed-in session.
11. As a registrant whose response does not require email confirmation, I want the success screen to offer the appropriate next step, so that the UI reflects the actual response.
12. As a person opening registration with an invitation token, I want the frontend to tell me that invitation completion is not supported by the confirmed contract, so that the token is not silently discarded and the UI does not claim that an invitation was accepted.
13. As an unverified user, I want to request another verification email from the existing verification screen, so that I can continue account setup.
14. As a user requesting verification, I want to see the backend's neutral response without a claim that delivery was confirmed, so that the screen does not promise an email the service cannot confirm.
15. As a signed-in user, I want sign-out to request backend session revocation and clear the browser session, so that the frontend ends my local session and asks the service to revoke its session.
16. As a signed-in user whose backend is unavailable during sign-out, I want the frontend to clear its local session and return me to sign-in anyway, so that a network failure cannot strand me in the portal.
17. As a lawyer, I want the Books screen to load the backend's register-book list, so that I see persisted books rather than placeholder counts.
18. As a lawyer with no books, I want to see a genuine empty state only after a successful empty response, so that a failed request is not mistaken for having no books.
19. As a lawyer whose book list cannot be loaded, I want a visible error and retry action, so that I can distinguish a service failure from an empty register.
20. As a lawyer, I want to register a book with a number from 1 through 1000 and a series year of at least 2000, so that the form follows the backend's validation rules.
21. As a lawyer, I want a newly created book to display the returned identifier, series year, and open status, so that the screen reflects the persisted record.
22. As a lawyer who submits a duplicate book number or a second open book for the same year, I want a clear conflict message and my form values retained, so that I can correct the request without losing work.
23. As a lawyer, I want book cards to show backend-provided entry and last-filing information, so that the screen does not invent document or page totals that the response does not contain.
24. As a lawyer, I want open and closed books to be clearly distinguished, so that a closed book is not incorrectly presented as full.
25. As a lawyer, I want to inspect a book's backend-provided creation and update timestamps, so that its details match the persisted record.
26. As a lawyer, I want to close an open book after confirming the action, so that I can mark a register volume closed without changing screens or using an unconnected endpoint.
27. As a lawyer closing a book, I want the action to show pending feedback and prevent duplicate submissions, so that I know the request is in progress and do not send it repeatedly.
28. As a lawyer, I want a successful close to update the book status and details, so that the visible record matches the service response.
29. As a lawyer, I want an already-closed conflict to leave the book visibly closed and explain the result, so that an error does not make the state ambiguous.
30. As a lawyer, I want the interface to make clear that no reopen operation is available in the confirmed contract, so that I do not expect a reversible action.
31. As a lawyer, I want to delete an empty book only after confirmation, so that an accidental deletion is less likely.
32. As a lawyer, I want a successful empty-body 204 delete response to remove the book without attempting to parse JSON, so that a valid deletion is handled correctly.
33. As a lawyer trying to delete a book with records, I want the backend conflict shown as an actionable error and the record retained in the list, so that the frontend does not imply that documents were deleted.
34. As a portal user, I want the existing visual structure, navigation, and control styling retained while these contracts are connected, so that integration does not redesign the product.
35. As a user, I want all API-backed screens to distinguish loading, success, empty, pending mutation, and failure states, so that slow or failed requests are not presented as completed work.

## Implementation Decisions

- **Boundary:** The LexChain frontend/backend boundary remains unchanged. Browser screens call same-origin frontend API routes and clients; server-side handlers forward requests to the configured external backend and keep bearer credentials server-side. The ignored backend checkout is source reference only.
- **Scope evidence:** The inspected local checkout registers four authentication operations and five book operations. Its deployed counterpart and runtime behavior remain unverified until the live service or its OpenAPI document is available.
- **Sign-in:** Use the role included in the sign-in response when present. Continue to derive the session cookie lifetime from the returned expiry. Do not require the absent profile operation merely to complete sign-in.
- **Role presentation:** Reuse the existing client-readable role hint set during sign-in to choose presentation and navigation for the current session. It is not an authorization credential. Book requests continue to rely on the bearer token and backend authorization, which requires the backend's exact lawyer role.
- **Profile limitation:** The local backend does not register the frontend's profile operation. Use the available role hint only for the portal shell and Books entry flow in this scope. Do not synthesize a full name, email, or profile response. Profile pages and features that require profile fields remain outside scope.
- **Signup contract:** The supported request contains email, password, f_name, and l_name. The confirmed backend validates names as 1–50 characters starting with a letter and containing letters, spaces, hyphens, or apostrophes. Passwords require at least eight characters, uppercase, lowercase, and a digit. The current frontend's special-character requirement is stricter than the backend contract and should be aligned without changing the form layout.
- **Invitation signup:** The current frontend can send phone_number and an invitation token, but the local signup operation does not define either field or consume invitations. Ordinary signup can be connected; invitation registration must not silently drop its token or show invitation completion. Keep that path clearly unresolved until a live contract proves support. No backend change is part of this spec.
- **Signup outcome:** Respect requires_email_confirmation and the backend message. A 201 account-created response is not an authenticated session. Signup errors preserve entered values and show a safe message derived from the response.
- **Verification resend:** Keep the existing verification screen and same-origin adapter. Display the neutral success message supplied by the backend; a 200 response does not establish actual email delivery.
- **Sign-out:** Portal sign-out should call the backend logout operation with the server-held bearer token, then expire local cookies regardless of upstream status or network failure. Keep the existing redirect to sign-in. There is no token-refresh operation in the confirmed backend contract. Apply the same local-cleanup guarantee to any existing sign-out entry point using this session.
- **Book operations:** Use the existing same-origin GET and mutation adapters for list, create, detail, close, and delete. Preserve the current list limit and query behavior unless the backend response requires a small contract adaptation. Do not create a separate browser-to-backend transport.
- **Book response mapping:** The confirmed response provides id, book_number, series_year, status, closed_at, entry_count, last_doc_no, last_page_no, created_at, and updated_at. The frontend's saved BookResponse shape expects fields that are absent from this response. Adapt and validate the consumed backend shape at the frontend boundary; do not edit generated OpenAPI output by hand.
- **Book display:** Present OPEN and CLOSED as lifecycle states; never translate CLOSED into Full. Retain the current card structure while using only returned entry and last-filing values. Do not manufacture page_count, document_count, or is_full values.
- **Create:** Send book_number and series_year; status is optional and defaults to OPEN in the backend. Keep the entered form data after validation, duplicate, open-book conflict, or network errors. Treat backend validation as authoritative.
- **Close:** Add a close action to the existing book-management surface for open books only. Require confirmation, show pending feedback, prevent duplicate submission, use the returned closed status and timestamp, and refresh affected book data. The confirmed contract has no reopen operation.
- **Delete:** Explain that only an empty book can be deleted. Confirm before sending the request, handle 204 as an empty response, refresh the list after success, and present 409 as a conflict that preserves the book. Do not state that book deletion cascades through its documents.
- **Errors and async states:** Preserve HTTP status and distinguish invalid input, unauthorized, forbidden, conflict, rate limit, upstream failure, and network failure where the screen can act differently. Read the local backend's message/details envelope as well as the frontend's existing detail/message form, with a safe fallback for malformed responses. Failed requests are never rendered as successful empty results.
- **Contract artifacts:** Treat the local backend source as provisional evidence and the checked-in generated contract as potentially stale. Refresh or regenerate generated API types only after the canonical live OpenAPI contract is available and reviewed. Use a focused frontend response schema/type for the confirmed local shapes in the meantime.
- **Visual behavior:** Preserve current screen layout, established components, navigation destinations, and accessible control names. Change labels and explanatory copy only where necessary for truthful OPEN/CLOSED, invitation, delete, or verification semantics.

### API operations in this scope

| Operation | Confirmed contract | Frontend result |
| --- | --- | --- |
| POST /auth/signin | Public JSON email/password; returns access and refresh tokens, expiry, and user identity including role. | Establish the existing frontend session; use the returned role when present. |
| POST /auth/signup | Public JSON email/password/f_name/l_name; returns 201 with account identity and email-confirmation requirement. | Support ordinary signup and its confirmation state. |
| POST /auth/resend-verification | Public JSON email; returns a neutral message. | Keep the verification screen's resend flow truthful. |
| POST /auth/logout | Bearer token, no body; returns a sign-out message. | Request upstream revocation and always clear local cookies. |
| GET /books/?limit=50&offset=0 | Bearer token, lawyer role; returns a BookResponse array without a total wrapper. | Populate the current book list and distinguish empty from failure. |
| POST /books/ | Bearer token, lawyer role; book number, year, optional status; returns 201 BookResponse. | Register an open book and refresh the list. |
| GET /books/{book_id} | Bearer token, lawyer role; returns BookResponse. | Show selected book details. |
| POST /books/{book_id}/close | Bearer token, lawyer role, no body; returns updated BookResponse. | Add the new close-book action and show the returned closed state. |
| DELETE /books/{book_id} | Bearer token, lawyer role, no body; empty 204 on success; 409 if the book is not empty. | Delete only eligible books and never parse a 204 body. |

## Testing Decisions

- Add **screen-level tests only**, as requested. Do not add new API-route unit tests or backend tests in this spec.
- Exercise the visible user journey using the existing screen test setup and mocked same-origin responses. Assert rendered feedback, enabled/disabled and pending controls, navigation outcome, form-value retention, and resulting book state. Avoid testing component internals.
- Cover sign-in success and failure; supported and unsupported role presentation; ordinary signup validation and confirmation; token-bearing signup's unresolved state; resend success/error messaging; sign-out redirect after local cleanup; and book list, empty, error/retry, create, detail, close, delete, and conflict behavior.
- Use the existing Books screen test and PortalLayout screen test as prior art. Add screen tests for auth and verification where coverage is absent. Existing role parsing tests and route tests remain in place but are not expanded for this feature.
- A screen test with mocked same-origin responses does not prove the deployed backend's behavior or cookie attributes. After a compatible backend is online, perform a manual integration pass against that service and reconcile the response contract before release.
- The inspected book-list implementation has a local runtime risk involving a document aggregate. If the service returns an error, verify that the screen shows an error/retry state rather than an empty list; do not work around a backend query defect in the frontend.

## Out of Scope

- Any source, schema, database, migration, deployment, or configuration change in the separate backend checkout.
- Document upload, OCR/review, finalization, verification, restore, search, Q&A, parties, invitations, requests, notifications, reports, or admin APIs.
- Implementing a profile endpoint or fabricating the full profile expected by unrelated screens.
- Invitation-token signup, phone-number persistence, password reset, token refresh, or account-role provisioning because the confirmed local contract does not expose the required operations.
- Changing backend authorization or relying on client-readable role state to grant access.
- Redesigning the portal, changing unrelated route behavior, adding dependencies, or adding offline API behavior.
- Claiming that the local checkout matches the deployed backend without a live contract check.

## Further Notes

- The companion backend-to-frontend integration guide contains the broader endpoint inventory and source-evidence labels. This spec intentionally narrows implementation to auth and books.
- The local reference has not been run as a live service in this task. The book-list query also has a source-level risk recorded in the companion guide; successful screen tests with mocked responses do not resolve that risk.
- This spec is limited to the first auth-and-books frontend phase. Later API groups should be scoped separately against the live contract.
