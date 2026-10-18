# Document Notifications: Timely and Actionable

## Goal

Keep document and Google draft feedback visible while a user remains in the portal, and let each notification open its related document or draft safely.

## Context

The checked-in OpenAPI defines notification `type` and an unconstrained `event_metadata` object. It does not define metadata keys by event type. The frontend currently drops both fields. The portal shell fetches the unread count and notification list once, topbar item clicks invoke read-all, and the inbox can mark one item read but does not navigate to its document or draft.

This is a frontend-only change. The backend remains authoritative for notification data and read state. The implementation will use the approved frontend assumption that metadata contains `document_id` and, for draft events, may contain `draft_url`. Missing or invalid values must remain safe and visible as notifications without an actionable destination.

## Behavior

### Refresh

- Poll the unread-count query and portal-shell notification-list query every 45 seconds while a supported portal role is active.
- Poll the inbox list every 45 seconds while the notifications page is mounted.
- Keep existing role-based query enabling and error/retry handling. Use React Query's interval lifecycle so inactive or unmounted queries stop polling.
- Do not optimistically change read state. Successful individual-read and read-all operations continue to invalidate the inbox, shell list, and count queries.

### Destinations

- Preserve notification `type` and `event_metadata` in the frontend notification value.
- For `party_added`, `party_removed`, `document_recorded`, `document_processed`, and `document_failed`, link to `/portal/documents/{document_id}` only when the ID matches the existing document-ID format `[A-Za-z0-9_-]{1,128}`.
- For `draft_comment`, `draft_reply`, `draft_resolved`, and `draft_reopened`, prefer `draft_url` only when it passes the existing Google draft URL check (`https:` and exact `docs.google.com` host). Open accepted Google Docs destinations in a new tab with `rel="noreferrer"`. If the URL is missing or invalid, use a valid `document_id` destination when available.
- Never construct a route or external link from an unchecked metadata value. Do not render arbitrary metadata. Unknown notification types and notifications without a valid destination remain visible in the inbox without a destination link; unread items keep an individual mark-as-read action, and the topbar falls back to `/portal/notifications`.
- Keep notification title, body, and date visible in both locations.

### Read actions

- Opening one unread notification from the topbar or inbox marks only that notification read. It must not call read-all.
- Start navigation immediately; do not wait for the read PATCH. The portal shell owns the mutation across portal route changes, shows its pending/error state, and invalidates queries only after success. A failed read leaves the item unread and available to click again as its retry.
- Read notifications remain actionable when they have a valid destination.
- Keep the inbox's explicit “Mark all as read” action. Keep pending and error states for individual and read-all requests; after failure, the unchanged action can be used to retry. Refresh all notification queries after success.
- A read failure must not hide the notification or falsely decrement the unread count.

## Verification

- Unit tests cover destination selection for every event family, malformed/missing IDs, invalid and valid Google URLs, safe fallback behavior, and individual/read-all request behavior.
- A deterministic Playwright browser check intercepts same-origin API requests and verifies: a notification arriving while the portal stays open appears in the topbar and updates the badge; document and draft destinations are correct; missing or malformed metadata does not navigate to an unchecked target; opening one item navigates immediately and marks only that item read; a failed item-read request leaves the item unread and allows retry; and explicit read-all marks all items read.
- Existing notification transport, topbar, inbox, and portal-layout tests remain in the normal Vitest discovery set.
- Mock notification fixtures include `type` and `event_metadata` so the mock shape can exercise the documented frontend behavior. This does not establish that a live backend emits these metadata keys.
- Run the relevant focused tests and required repository checks. Report mocked browser evidence separately from any live-backend verification; no live backend verification is implied by this spec.

## Scope

Included: notification query refresh, notification type/metadata preservation, validated navigation in the inbox and topbar, separate per-item and read-all actions, focused regression coverage, deterministic browser coverage, and the mock fixtures needed for that coverage.

Excluded: backend schema or persistence changes, new notification preferences, push delivery, offline queues, live-backend claims, new notification types, and rendering or logging private event metadata.

## Decisions and Limits

- The exact event metadata contract is unavailable in the checked-in OpenAPI. `document_id` and `draft_url` are the user-approved frontend assumption. If the backend emits different keys, the backend contract and this mapping must be updated together.
- The existing `isGoogleDraftUrl` helper defines an accepted draft URL as HTTPS on the exact `docs.google.com` hostname. The implementation will reuse this project rule.
- The browser check uses intercepted responses and proves frontend behavior only. The parent workflow's separate live-backend browser journey remains subject to its configured disposable backend and test-account prerequisites; this issue's mock check does not substitute for it.
