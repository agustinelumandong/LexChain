# Task 4 report: participant invitations and e-copy requests

## Delivered

- Added participant invitation workspace at `/portal/invitations`.
  - Displays document title, sent time, party role, Accept, and Reject.
  - Accept uses `POST /documents/{document_id}/parties/accept` through the existing `/api/portal/proxy-post` route, then navigates to the accepted document.
  - Reject uses `POST /documents/{document_id}/parties/reject` through the same proxy.
  - Empty state: `No pending invitations`.
- Added participant e-copy request status page at `/portal/requests/my`.
  - Uses `GET /requests/my` through the existing portal proxy.
  - Shows status and rejection reason when supplied.
- Added issuer request management at `/portal/requests`.
  - Uses `GET /requests` with Pending, Approved, and Rejected filters.
  - Shows requester name/email, document, description, and submitted date.
  - Uses `PATCH /requests/{request_id}/review` through the existing portal proxy.
  - Only issuer rendering exposes Approve/Reject controls; rejection cannot be confirmed without a reason.
- Added the shared request-status component and tested request-action helper.
- Exposed navigation only after the pages existed:
  - Document Issuer: Document Requests.
  - Document Participant: Invitations and My E-copy Requests.

## API contract check

`openapi-updated.json` documents all required endpoints and methods. There is no backend endpoint gap for this slice:

- `GET /documents/invitations`
- `POST /documents/{document_id}/parties/accept`
- `POST /documents/{document_id}/parties/reject`
- `GET /requests`
- `GET /requests/my`
- `PATCH /requests/{request_id}/review`

No backend routes or proxy routes were added or changed.

## Verification

- `pnpm test -- app/portal/lib/request-ui.test.ts app/portal/lib/portal-dashboard.test.ts` — passed (15 tests across 5 test files).
- `pnpm lint` — passed.
- `pnpm build` — passed. Next.js reported its pre-existing multiple-lockfile workspace-root warning, but compiled, type-checked, and emitted all routes successfully.
- `git diff --check` — passed.

## Manual-flow boundary

The live UI routes are present in the production build. A full authenticated mutation walkthrough requires a running backend. The local portal mock currently has no invitation/request endpoint fixtures, so mock mode returns its existing `Mock endpoint not found` response rather than a fabricated success; no fake success behavior was added.
