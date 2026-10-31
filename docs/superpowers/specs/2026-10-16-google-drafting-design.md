# Google Drafting Recovery Design

## Goal

Make Google document drafting recoverable across connection and consent flows, and make a newly created draft visible to the current document workspace immediately.

## Scope and constraints

- Implement frontend behavior for issue #117 only; Google OAuth, Drive, Picker authorization, document persistence, and authorization remain backend or Google responsibilities.
- Preserve existing route URLs, callback feedback, disconnect behavior, API payloads, and validated Google Docs links.
- A blank draft must not require Picker configuration. Template and existing-document drafts continue using the backend Picker token and configured API key and App ID, with the Google Docs MIME filter.
- Treat `GOOGLE_NOT_CONNECTED` and `GOOGLE_RECONNECT_REQUIRED` in `details.reason` as recoverable connection states while retaining compatibility with current error shapes.
- The backend callback must redirect to the frontend account page at `/portal/profile/account`; this is the required frontend destination, not evidence that backend configuration is set.

## Design

### Connection and return context

Keep `/portal/profile/account` as the frontend callback landing page. When connection starts from a document, store only the document ID, draft source, and selected Picker file ID and name in `sessionStorage`. Do not store credentials, tokens, arbitrary return URLs, or authorization responses. Validate the context and construct the return path from the validated document ID; never navigate to a raw stored URL.

On a successful callback, preserve the existing account connection feedback and return to the originating document with the saved draft choices restored. Clear the context after it is consumed, and do not create a draft automatically. Account-originated connection has no document context and remains on the account page. Callback error feedback and disconnect behavior remain available on the account page. If the selected file is no longer usable, clear that selection and allow the user to pick another file.

Before navigating to Google's consent screen, show: “On Google's screen, tick the Google Drive permission.” Keep the existing whole-window navigation and validated Google authorization URL.

### Draft creation and workspace state

Parse `details.reason` for the two documented connection errors and offer the existing account connection flow without discarding the current draft source or selection. Picker cancellation does not erase a prior selection. Missing Picker configuration and Picker service errors remain recoverable in the form; blank drafts bypass Picker.

After successful draft creation, publish the returned document detail through the existing `['portal-doc', id]` query flow, then refresh the document list and relevant document history. The Comments tab, permission controls, and readiness actions derive from this updated document. Keep “Open draft” as an explicit new-tab action and validate its URL before rendering it.

### Verification and documentation

Add focused tests for documented error envelopes, preserved choices, Picker cancellation/reselection, callback success/error and safe return handling, and immediate workspace updates. Add deterministic browser coverage for the frontend consent/callback round trip, restored choices, stale selection recovery, and unsafe return context. Stub external Google calls and label that evidence as frontend-only; do not claim live OAuth or backend configuration verification.

## Alternatives considered

- A dedicated callback route would duplicate the existing account connection feedback surface. Reuse the current account page instead.
- Keep the draft URL only in panel-local state. This leaves Comments, permissions, readiness controls, and other query consumers stale. Update the existing document query with the backend response instead.

## Acceptance boundary

The frontend can validate its consent link, callback landing behavior, session context, and query updates with deterministic stubs. The actual value of backend `GOOGLE_CONNECTED_REDIRECT`, Google consent, and live Picker/Drive behavior require backend/deployment configuration and are not verified by frontend tests.
